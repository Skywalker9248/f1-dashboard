const axios = require('axios');

// --- CONFIGURATION ---
const OPENF1_URL = 'https://api.openf1.org/v1';
const JOLPICA_URL = 'https://api.jolpi.ca/ergast/f1';

// --- HELPER: Team Colors (Jolpica doesn't provide these, so we map them) ---
const TEAM_COLORS = {
    'Red Bull': '3671C6',
    'Mercedes': '27F4D2',
    'Ferrari': 'E80020',
    'McLaren': 'FF8000',
    'Aston Martin': '229971',
    'Alpine': '0093CC',
    'Williams': '64C4FF',
    'RB': '6692FF', 
    'Kick Sauber': '52E252',
    'Haas': 'B6BABD',
    'Haas F1 Team': 'B6BABD'
};

function getTeamColor(teamName) {
    // Try exact match first, then fuzzy match
    if (TEAM_COLORS[teamName]) return TEAM_COLORS[teamName];
    const key = Object.keys(TEAM_COLORS).find(k => teamName.includes(k));
    return key ? TEAM_COLORS[key] : '000000';
}

// --- CHAMPIONSHIP STANDINGS (Via Jolpica) ---

/**
 * Get Driver Standings
 * Fetches pre-calculated points from Jolpica (Instant & Accurate)
 */
exports.getDriverStandings = async () => {
    try {
        const currentYear = new Date().getFullYear();
        
        // Fetch from Jolpica (Ergast compatible)
        const response = await axios.get(`${JOLPICA_URL}/${currentYear}/driverStandings.json?limit=100`);
        
        // Navigate strictly through the Ergast-style JSON structure
        const table = response.data?.MRData?.StandingsTable?.StandingsLists?.[0];
        
        if (!table) {
             return { season: currentYear, standings: [] };
        }

        const standings = table.DriverStandings.map(d => ({
            position: parseInt(d.position),
            points: parseFloat(d.points),
            wins: parseInt(d.wins),
            driverNumber: parseInt(d.Driver.permanentNumber),
            driver: `${d.Driver.givenName} ${d.Driver.familyName}`,
            driverAcronym: d.Driver.code,
            team: d.Constructors[0]?.name || 'Unknown',
            teamColor: getTeamColor(d.Constructors[0]?.name || ''),
            nationality: d.Driver.nationality,
            headshotUrl: '' // Jolpica doesn't have headshots, handle in frontend or use placeholder
        }));

        return { season: parseInt(table.season), standings };

    } catch (error) {
        console.error('Error fetching driver standings:', error.message);
        return { season: new Date().getFullYear(), standings: [] };
    }
};

/**
 * Get Constructor Standings
 */
exports.getConstructorStandings = async () => {
    try {
        const currentYear = new Date().getFullYear();
        const response = await axios.get(`${JOLPICA_URL}/${currentYear}/constructorStandings.json?limit=100`);
        
        const table = response.data?.MRData?.StandingsTable?.StandingsLists?.[0];

        if (!table) return { season: currentYear, standings: [] };

        const standings = table.ConstructorStandings.map(c => ({
            position: parseInt(c.position),
            points: parseFloat(c.points),
            wins: parseInt(c.wins),
            team: c.Constructor.name,
            teamColor: getTeamColor(c.Constructor.name),
            nationality: c.Constructor.nationality,
            wikiUrl: c.Constructor.url
        }));

        return { season: parseInt(table.season), standings };

    } catch (error) {
        console.error('Error fetching constructor standings:', error.message);
        throw error;
    }
};


// --- RACE & SESSION DATA (Via OpenF1) ---

/**
 * Get the most recent completed race session
 */
async function getLatestRaceSession() {
    const currentYear = new Date().getFullYear();
    const now = new Date();
    
    try {
        // 1. Try current year
        let res = await axios.get(`${OPENF1_URL}/sessions?session_name=Race&year=${currentYear}`);
        let sessions = res.data;
        
        // 2. Fallback to previous year if early in season
        if (!sessions || sessions.length === 0) {
            res = await axios.get(`${OPENF1_URL}/sessions?session_name=Race&year=${currentYear - 1}`);
            sessions = res.data;
        }
        
        if (!sessions || sessions.length === 0) return null;
        
        // 3. Filter for races that have actually finished
        const completedSessions = sessions.filter(s => new Date(s.date_start) < now);

        // 4. Sort newest first
        completedSessions.sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
        
        return completedSessions[0];
    } catch (error) {
        console.error('Error fetching session:', error.message);
        return null;
    }
}

/**
 * Get results of the last race with full driver details
 */
exports.getLastRaceResults = async () => {
    try {
        const session = await getLatestRaceSession();
        if (!session) throw new Error('No completed race session found');

        console.log(`Fetching results for: ${session.session_name} - ${session.circuit_short_name}`);

        // Parallel fetch for speed
        const [resultsRes, driversRes, lapsRes] = await Promise.all([
            axios.get(`${OPENF1_URL}/session_result?session_key=${session.session_key}`),
            axios.get(`${OPENF1_URL}/drivers?session_key=${session.session_key}`),
            axios.get(`${OPENF1_URL}/laps?session_key=${session.session_key}`) // Needed for Fastest Lap
        ]);

        const results = resultsRes.data;
        const drivers = driversRes.data;
        const laps = lapsRes.data;

        // 1. Determine Fastest Lap Driver
        // Filter out invalid laps, sort by duration ascending
        const validLaps = laps.filter(l => l.lap_duration !== null);
        validLaps.sort((a, b) => a.lap_duration - b.lap_duration);
        const fastestLapDriverNum = validLaps.length > 0 ? validLaps[0].driver_number : null;
        const fastestLapTime = validLaps.length > 0 ? validLaps[0].lap_duration : 0;

        // 2. Create Driver Map
        const driverMap = {};
        drivers.forEach(d => {
            driverMap[d.driver_number] = {
                fullName: d.full_name,
                acronym: d.name_acronym,
                team: d.team_name,
                teamColor: d.team_colour, // OpenF1 gives hex codes here
                headshotUrl: d.headshot_url,
                countryCode: d.country_code
            };
        });

        // 3. Build Standings Array
        // OpenF1 points in session_result are sometimes unreliable immediately, 
        // but position is accurate. We rely on position.
        const POINTS_MAP = {1:25, 2:18, 3:15, 4:12, 5:10, 6:8, 7:6, 8:4, 9:2, 10:1};
        
        const standings = results
            .sort((a, b) => a.position - b.position)
            .map(result => {
                const info = driverMap[result.driver_number] || { fullName: 'Unknown', team: 'Unknown' };
                const hasFastestLap = (result.driver_number === fastestLapDriverNum);
                
                // Calculate points manually for safety
                let points = POINTS_MAP[result.position] || 0;
                if (hasFastestLap && result.position <= 10) points += 1;

                return {
                    position: result.position,
                    driver: info.fullName,
                    driverAcronym: info.acronym,
                    driverNumber: result.driver_number,
                    team: info.team,
                    teamColor: info.teamColor,
                    points: points,
                    hasFastestLap: hasFastestLap,
                    time: result.time || 'DNF', // Gap to leader or DNF
                    headshotUrl: info.headshotUrl,
                    countryCode: info.countryCode,
                    dnf: result.status > 0 && result.status !== 'Finished' // Simple DNF check
                };
            });

        return {
            sessionInfo: {
                circuit: session.circuit_short_name,
                location: session.location,
                country: session.country_name,
                date: session.date_start,
                name: session.session_name,
                fastestLapTime: fastestLapTime
            },
            standings
        };

    } catch (error) {
        console.error('Error in getLastRaceResults:', error.message);
        throw error;
    }
};

/**
 * Get next upcoming race details
 */
exports.getNextRace = async () => {
    try {
        const currentYear = new Date().getFullYear();
        const now = new Date();
        
        // Get all sessions for year
        const res = await axios.get(`${OPENF1_URL}/sessions?year=${currentYear}`);
        const sessions = res.data;
        
        // Find next session that hasn't started
        const upcoming = sessions
            .filter(s => new Date(s.date_start) > now)
            .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
            
        if (upcoming.length === 0) {
             return { message: 'Season finished', nextSeason: currentYear + 1 };
        }

        // Get the "Race" session of that meeting to get the main event details
        const nextRaceSession = upcoming.find(s => s.session_name === 'Race') || upcoming[0];
        
        // Get all sessions for that specific meeting (FP1, FP2, Quali, Race)
        const meetingSessions = sessions
            .filter(s => s.meeting_key === nextRaceSession.meeting_key)
            .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));

        return {
            circuit: nextRaceSession.circuit_short_name,
            location: nextRaceSession.location,
            country: nextRaceSession.country_name,
            raceDate: nextRaceSession.date_start,
            meetingKey: nextRaceSession.meeting_key,
            sessions: meetingSessions.map(s => ({
                name: s.session_name,
                start: s.date_start,
                end: s.date_end
            }))
        };
    } catch (error) {
        console.error('Error fetching next race:', error.message);
        throw error;
    }
};

/**
 * Get list of all drivers (for dropdowns/lists)
 */
exports.getDriverList = async () => {
    try {
        const session = await getLatestRaceSession();
        if (!session) return [];
        
        const res = await axios.get(`${OPENF1_URL}/drivers?session_key=${session.session_key}`);
        
        // Dedup drivers
        const seen = new Set();
        return res.data.filter(d => {
            if (seen.has(d.driver_number)) return false;
            seen.add(d.driver_number);
            return true;
        }).map(d => ({
            number: d.driver_number,
            name: d.full_name,
            acronym: d.name_acronym,
            team: d.team_name,
            headshotUrl: d.headshot_url
        }));
    } catch (error) {
        return [];
    }
};