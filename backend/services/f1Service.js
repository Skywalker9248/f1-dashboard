const axios = require('axios');

const OPENF1_URL = 'https://api.openf1.org/v1';

/**
 * Get the most recent completed race session
 * Tries current year first, then falls back to previous year
 */
async function getLatestRaceSession() {
    const currentYear = new Date().getFullYear();
    
    try {
        // Try current year first
        const res = await axios.get(`${OPENF1_URL}/sessions?session_name=Race&year=${currentYear}`);
        let sessions = res.data;
        
        // If no sessions found for current year, try previous year
        if (!sessions || sessions.length === 0) {
            console.log(`No race sessions found for ${currentYear}, trying ${currentYear - 1}`);
            const resPrev = await axios.get(`${OPENF1_URL}/sessions?session_name=Race&year=${currentYear - 1}`);
            sessions = resPrev.data;
        }
        
        if (!sessions || sessions.length === 0) {
            throw new Error('No race sessions found');
        }
        
        // Sort by date to get the most recent session
        sessions.sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
        return sessions[0];
        
    } catch (error) {
        console.error('Error fetching session:', error.message);
        throw error;
    }
}

/**
 * Get all race and sprint sessions for a given year
 */
async function getAllRaceSessions(year) {
    try {
        // Fetch both regular races and sprint races
        const [raceRes, sprintRes] = await Promise.all([
            axios.get(`${OPENF1_URL}/sessions?session_name=Race&year=${year}`),
            axios.get(`${OPENF1_URL}/sessions?session_name=Sprint&year=${year}`)
        ]);
        
        const races = raceRes.data || [];
        const sprints = sprintRes.data || [];
        
        // Combine and sort by date
        const allSessions = [...races, ...sprints];
        allSessions.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
        
        return allSessions;
    } catch (error) {
        console.error('Error fetching race sessions:', error.message);
        return [];
    }
}

/**
 * Get last race results using the latest OpenF1 API
 * Uses the session_result endpoint for accurate race standings
 */
exports.getLastRaceResults = async () => {
    try {
        const session = await getLatestRaceSession();
        if (!session) throw new Error('No race session found');

        console.log(`Fetching data for session: ${session.session_name} at ${session.circuit_short_name} (${session.date_start})`);

        // Fetch session results and driver information in parallel
        const [sessionResultRes, driversRes] = await Promise.all([
            axios.get(`${OPENF1_URL}/session_result?session_key=${session.session_key}`),
            axios.get(`${OPENF1_URL}/drivers?session_key=${session.session_key}`)
        ]);

        const sessionResults = sessionResultRes.data;
        const drivers = driversRes.data;

        // Create a map of driver_number -> driver info
        const driverMap = {};
        drivers.forEach(d => {
            driverMap[d.driver_number] = {
                fullName: d.full_name,
                acronym: d.name_acronym,
                team: d.team_name,
                teamColor: d.team_colour,
                headshotUrl: d.headshot_url,
                countryCode: d.country_code
            };
        });

        // Sort results by position and enrich with driver information
        const standings = sessionResults
            .sort((a, b) => a.position - b.position)
            .map(result => {
                const driverInfo = driverMap[result.driver_number] || {
                    fullName: 'Unknown',
                    acronym: 'UNK',
                    team: 'Unknown',
                    teamColor: '000000'
                };
                
                // Calculate points based on position (standard F1 points system)
                const pointsSystem = {
                    1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
                    6: 8, 7: 6, 8: 4, 9: 2, 10: 1
                };
                
                return {
                    position: result.position,
                    driver: driverInfo.fullName,
                    driverAcronym: driverInfo.acronym,
                    driverNumber: result.driver_number,
                    team: driverInfo.team,
                    teamColor: driverInfo.teamColor,
                    points: pointsSystem[result.position] || 0,
                    headshotUrl: driverInfo.headshotUrl,
                    countryCode: driverInfo.countryCode,
                    dnf: result.dnf || false,
                    dns: result.dns || false,
                    dsq: result.dsq || false,
                    gapToLeader: result.gap_to_leader || 0,
                    numberOfLaps: result.number_of_laps || 0
                };
            });

        // Return enriched data with session information
        return {
            sessionInfo: {
                circuit: session.circuit_short_name,
                location: session.location,
                country: session.country_name,
                date: session.date_start,
                sessionName: session.session_name,
                sessionType: session.session_type
            },
            standings: standings
        };

    } catch (error) {
        console.error('Error fetching OpenF1 data:', error.message);
        throw error;
    }
};

/**
 * Get overall driver championship standings for the season
 */
exports.getDriverStandings = async () => {
    try {
        const currentYear = new Date().getFullYear();
        const sessions = await getAllRaceSessions(currentYear);
        
        if (sessions.length === 0) {
            // Try previous year if current year has no data
            console.log(`No sessions found for ${currentYear}, trying ${currentYear - 1}`);
            const prevYearSessions = await getAllRaceSessions(currentYear - 1);
            if (prevYearSessions.length === 0) {
                throw new Error('No race sessions found for standings');
            }
            const standings = await calculateStandings(prevYearSessions);
            return { season: currentYear - 1, standings };
        }
        
        const standings = await calculateStandings(sessions);
        return { season: currentYear, standings };
    } catch (error) {
        console.error('Error fetching driver standings:', error.message);
        throw error;
    }
};

/**
 * Calculate driver standings from multiple race sessions
 */
async function calculateStandings(sessions) {
    const driverPoints = {};
    const driverInfo = {};
    
    // Regular race points system
    const racePointsSystem = {
        1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
        6: 8, 7: 6, 8: 4, 9: 2, 10: 1
    };
    
                if (points > 0) {
                    driverPoints[result.driver_number] += points;
                    console.log(`  Driver #${result.driver_number} finished P${result.position}, earned ${points} points (${isSprint ? 'Sprint' : 'Race'})`);
                }
            });
        } catch (err) {
            console.log(`Skipping session ${session.session_key}: ${err.message}`);
        }
    }
    
    // Convert to array and sort by points
    const standings = Object.entries(driverPoints)
        .map(([driverNumber, points]) => {
            const info = driverInfo[driverNumber] || {
                fullName: 'Unknown',
                acronym: 'UNK',
                team: 'Unknown',
                teamColor: '000000'
            };
            
            return {
                driverNumber: parseInt(driverNumber),
                driver: info.fullName,
                driverAcronym: info.acronym,
                team: info.team,
                teamColor: info.teamColor,
                headshotUrl: info.headshotUrl,
                countryCode: info.countryCode,
                points: points
            };
        })
        .sort((a, b) => b.points - a.points)
        .map((driver, index) => ({
            ...driver,
            position: index + 1
        }));
    
    return standings;
}

/**
 * Get constructor/team championship standings
 */
exports.getConstructorStandings = async () => {
    try {
        const driverStandingsResponse = await exports.getDriverStandings();
        
        // Extract standings array from the new response format
        const driverStandings = driverStandingsResponse.standings || driverStandingsResponse;
        const season = driverStandingsResponse.season || new Date().getFullYear();
        
        // Aggregate points by team
        const teamPoints = {};
        const teamInfo = {};
        
        driverStandings.forEach(driver => {
            if (!teamPoints[driver.team]) {
                teamPoints[driver.team] = 0;
                teamInfo[driver.team] = {
                    teamColor: driver.teamColor
                };
            }
            teamPoints[driver.team] += driver.points;
        });
        
        // Convert to array and sort
        const constructorStandings = Object.entries(teamPoints)
            .map(([team, points]) => ({
                team: team,
                teamColor: teamInfo[team].teamColor,
                points: points
            }))
            .sort((a, b) => b.points - a.points)
            .map((team, index) => ({
                ...team,
                position: index + 1
            }));
        
        return { season, standings: constructorStandings };
    } catch (error) {
        console.error('Error fetching constructor standings:', error.message);
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
        
        // Get all sessions for current year
        const res = await axios.get(`${OPENF1_URL}/sessions?year=${currentYear}`);
        const sessions = res.data;
        
        if (!sessions || sessions.length === 0) {
            throw new Error('No sessions found for current year');
        }
        
        // Find the next race session that hasn't occurred yet
        const upcomingSessions = sessions
            .filter(s => new Date(s.date_start) > now)
            .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
        
        if (upcomingSessions.length === 0) {
            return {
                message: 'No upcoming races this season',
                nextSeason: currentYear + 1
            };
        }
        
        // Get the next race and all sessions for that meeting
        const nextRace = upcomingSessions.find(s => s.session_name === 'Race');
        
        if (!nextRace) {
            return {
                message: 'No upcoming races found',
                nextSeason: currentYear + 1
            };
        }
        
        // Get all sessions for this meeting (practice, qualifying, etc.)
        const meetingSessions = sessions
            .filter(s => s.meeting_key === nextRace.meeting_key)
            .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
        
        return {
            circuit: nextRace.circuit_short_name,
            location: nextRace.location,
            country: nextRace.country_name,
            raceDate: nextRace.date_start,
            meetingKey: nextRace.meeting_key,
            sessions: meetingSessions.map(s => ({
                sessionName: s.session_name,
                sessionType: s.session_type,
                dateStart: s.date_start,
                dateEnd: s.date_end
            }))
        };
    } catch (error) {
        console.error('Error fetching next race:', error.message);
        throw error;
    }
};

/**
 * Get list of drivers with enhanced information
 */
exports.getDriverList = async () => {
    try {
        const session = await getLatestRaceSession();
        if (!session) return [];
        
        const res = await axios.get(`${OPENF1_URL}/drivers?session_key=${session.session_key}`);
        return res.data.map(d => ({
            id: d.driver_number,
            number: d.driver_number,
            name: d.full_name,
            acronym: d.name_acronym,
            team: d.team_name,
            teamColor: d.team_colour,
            headshotUrl: d.headshot_url,
            countryCode: d.country_code
        }));
    } catch (error) {
        console.error('Error fetching driver list:', error.message);
        return [];
    }
};
