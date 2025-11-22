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
                    gapToLeader: result.gap_to_leader || 0,
                    time: result.time || 'DNF',
                    headshotUrl: info.headshotUrl,
                    countryCode: info.countryCode,
                    dnf: result.dnf,
                    dns: result.dns,
                    dsq: result.dsq
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
        // 1. Get Next Race Schedule from Jolpica (Ergast replacement)
        const scheduleRes = await axios.get('http://api.jolpi.ca/ergast/f1/current/next.json');
        const raceData = scheduleRes.data.MRData.RaceTable.Races[0];

        if (!raceData) {
            return { message: 'Season finished', nextSeason: new Date().getFullYear() + 1 };
        }

        // 2. Extract Location for Weather
        const lat = raceData.Circuit.Location.lat;
        const long = raceData.Circuit.Location.long;
        const raceDateStr = raceData.date; // YYYY-MM-DD

        // 3. Fetch Weather from Open-Meteo (Free, no key needed)
        // We ask for daily max/min temp and max precipitation probability for the race day
        let weatherData = null;
        try {
            const weatherRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
                params: {
                    latitude: lat,
                    longitude: long,
                    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
                    timezone: 'auto',
                    start_date: raceDateStr,
                    end_date: raceDateStr
                }
            });
            
            const daily = weatherRes.data.daily;
            if (daily) {
                weatherData = {
                    tempMax: daily.temperature_2m_max[0],
                    tempMin: daily.temperature_2m_min[0],
                    precipProb: daily.precipitation_probability_max[0],
                    weatherCode: daily.weather_code[0]
                };
            }
        } catch (wErr) {
            console.warn('Weather fetch failed, continuing without weather:', wErr.message);
        }

        // 4. Helper to construct sessions with estimated end times
        const createSession = (name, dateStr, timeStr, durationMinutes) => {
            const start = new Date(`${dateStr}T${timeStr}`);
            const end = new Date(start.getTime() + durationMinutes * 60000);
            return {
                sessionName: name,
                sessionType: name.includes('Practice') ? 'Practice' : name.includes('Qualifying') ? 'Qualifying' : 'Race',
                dateStart: start.toISOString(),
                dateEnd: end.toISOString()
            };
        };

        // 5. Build Sessions List
        const sessions = [];
        // Standard durations (approximate)
        if (raceData.FirstPractice) sessions.push(createSession('Practice 1', raceData.FirstPractice.date, raceData.FirstPractice.time, 60));
        if (raceData.SecondPractice) sessions.push(createSession('Practice 2', raceData.SecondPractice.date, raceData.SecondPractice.time, 60));
        if (raceData.ThirdPractice) sessions.push(createSession('Practice 3', raceData.ThirdPractice.date, raceData.ThirdPractice.time, 60));
        if (raceData.SprintQualifying) sessions.push(createSession('Sprint Qualifying', raceData.SprintQualifying.date, raceData.SprintQualifying.time, 45));
        if (raceData.Sprint) sessions.push(createSession('Sprint', raceData.Sprint.date, raceData.Sprint.time, 60));
        if (raceData.Qualifying) sessions.push(createSession('Qualifying', raceData.Qualifying.date, raceData.Qualifying.time, 60));
        
        // Race (usually 2 hours window)
        sessions.push(createSession('Race', raceData.date, raceData.time, 120));

        // Sort by time
        sessions.sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart));

        return {
            circuit: raceData.Circuit.circuitName,
            location: raceData.Circuit.Location.locality,
            country: raceData.Circuit.Location.country,
            raceDate: `${raceData.date}T${raceData.time}`,
            meetingKey: raceData.round, // Using round number as key
            sessions: sessions,
            weather: weatherData
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