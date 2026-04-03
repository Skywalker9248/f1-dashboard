import axios from 'axios';
import {
  OPENF1_URL,
  JOLPICA_URL,
  OPEN_METEO_URL,
  POINTS_MAP,
  SESSION_DURATION,
} from '../../constants.js';

// --- HELPER: Team Colors (Jolpica doesn't provide these, so we map them) ---
const TEAM_COLORS = {
  'Red Bull': '3671C6',
  Mercedes: '27F4D2',
  Ferrari: 'E80020',
  McLaren: 'FF8000',
  'Aston Martin': '229971',
  Alpine: '0093CC',
  Williams: '64C4FF',
  RB: '6692FF',
  'Kick Sauber': '52E252',
  Haas: 'B6BABD',
  'Haas F1 Team': 'B6BABD',
};

function getTeamColor(teamName) {
  // Try exact match first, then fuzzy match
  if (TEAM_COLORS[teamName]) return TEAM_COLORS[teamName];
  const key = Object.keys(TEAM_COLORS).find((k) => teamName.includes(k));
  return key ? TEAM_COLORS[key] : '000000';
}

// --- CLOUDFLARE CACHE API HELPER ---

/**
 * Fetch with Cloudflare Cache API caching (replaces the in-memory Map cache).
 * Uses caches.default (HTTP Cache API) which persists across requests at the edge.
 * @param {string} cacheKey  - Unique string key for the cached entry
 * @param {Function} fetchFn - Async function that fetches and returns the raw data
 * @param {number} ttlSeconds - Cache TTL in seconds
 * @returns {Promise<any>}
 */
async function cachedFetch(cacheKey, fetchFn, ttlSeconds = 30) {
  const url = `https://cache.local/${cacheKey}`;
  const cache = caches.default;

  // Try cache first
  const cached = await cache.match(url);
  if (cached) return cached.json();

  // Fetch fresh data
  const data = await fetchFn();

  // Store in cache with TTL
  const response = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${ttlSeconds}`,
    },
  });
  await cache.put(url, response);
  return data;
}

// --- CHAMPIONSHIP STANDINGS (Via Jolpica) ---

/**
 * Get Driver Standings
 * Fetches pre-calculated points from Jolpica (Instant & Accurate)
 * @returns {Promise<{ season: number, standings: object[] }>}
 * @throws {Error} When the Jolpica API request fails
 */
export const getDriverStandings = async () => {
  try {
    const currentYear = new Date().getFullYear();

    // Fetch from Jolpica (Ergast compatible)
    const response = await axios.get(
      `${JOLPICA_URL}/${currentYear}/driverStandings.json?limit=100`
    );

    // Navigate strictly through the Ergast-style JSON structure
    const table = response.data?.MRData?.StandingsTable?.StandingsLists?.[0];

    if (!table) {
      return { season: currentYear, standings: [] };
    }

    const standings = table.DriverStandings.map((d) => ({
      position: parseInt(d.position),
      points: parseFloat(d.points),
      wins: parseInt(d.wins),
      driverNumber: parseInt(d.Driver.permanentNumber),
      driver: `${d.Driver.givenName} ${d.Driver.familyName}`,
      driverAcronym: d.Driver.code,
      team: d.Constructors[0]?.name || 'Unknown',
      teamColor: getTeamColor(d.Constructors[0]?.name || ''),
      nationality: d.Driver.nationality,
      headshotUrl: '', // Jolpica doesn't have headshots, handle in frontend or use placeholder
    }));

    return { season: parseInt(table.season), standings };
  } catch (error) {
    console.error('Error fetching driver standings:', error.message);
    throw error;
  }
};

/**
 * Get Constructor Championship Standings
 * @returns {Promise<{ season: number, standings: object[] }>}
 * @throws {Error} When the Jolpica API request fails
 */
export const getConstructorStandings = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const response = await axios.get(
      `${JOLPICA_URL}/${currentYear}/constructorStandings.json?limit=100`
    );

    const table = response.data?.MRData?.StandingsTable?.StandingsLists?.[0];

    if (!table) return { season: currentYear, standings: [] };

    const standings = table.ConstructorStandings.map((c) => ({
      position: parseInt(c.position),
      points: parseFloat(c.points),
      wins: parseInt(c.wins),
      team: c.Constructor.name,
      teamColor: getTeamColor(c.Constructor.name),
      nationality: c.Constructor.nationality,
      wikiUrl: c.Constructor.url,
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
    let res = await axios.get(
      `${OPENF1_URL}/sessions?session_name=Race&year=${currentYear}`,
      { timeout: 10_000 }
    );
    let sessions = res.data;

    // 2. Fallback to previous year if early in season
    if (!sessions || sessions.length === 0) {
      res = await axios.get(
        `${OPENF1_URL}/sessions?session_name=Race&year=${currentYear - 1}`,
        { timeout: 10_000 }
      );
      sessions = res.data;
    }

    if (!sessions || sessions.length === 0) return null;

    // 3. Filter for races that have actually finished
    const completedSessions = sessions.filter(
      (s) => new Date(s.date_start) < now
    );

    // 4. Sort newest first
    completedSessions.sort(
      (a, b) => new Date(b.date_start) - new Date(a.date_start)
    );

    return completedSessions[0];
  } catch (error) {
    console.error('Error fetching session:', error.message);
    return null;
  }
}

/**
 * Get results of the last completed race with full driver details
 * @returns {Promise<{ sessionInfo: object, standings: object[] }>}
 * @throws {Error} When no completed race session is found or OpenF1 request fails
 */
export const getLastRaceResults = async () => {
  try {
    const session = await getLatestRaceSession();
    if (!session) throw new Error('No completed race session found');

    console.log(
      `Fetching results for: ${session.session_name} - ${session.circuit_short_name}`
    );

    // Parallel fetch for speed
    const [resultsRes, driversRes, lapsRes] = await Promise.all([
      axios.get(
        `${OPENF1_URL}/session_result?session_key=${session.session_key}`
      ),
      axios.get(`${OPENF1_URL}/drivers?session_key=${session.session_key}`),
      axios.get(`${OPENF1_URL}/laps?session_key=${session.session_key}`), // Needed for Fastest Lap
    ]);

    const results = resultsRes.data;
    const drivers = driversRes.data;
    const laps = lapsRes.data;

    const validLaps = laps.filter((l) => l.lap_duration !== null);
    validLaps.sort((a, b) => a.lap_duration - b.lap_duration);
    const fastestLapDriverNum =
      validLaps.length > 0 ? validLaps[0].driver_number : null;
    const fastestLapTime = validLaps.length > 0 ? validLaps[0].lap_duration : 0;

    // Calculate fastest lap for each driver
    const driverFastestLaps = {};
    laps.forEach((lap) => {
      if (lap.lap_duration !== null) {
        if (
          !driverFastestLaps[lap.driver_number] ||
          lap.lap_duration < driverFastestLaps[lap.driver_number]
        ) {
          driverFastestLaps[lap.driver_number] = lap.lap_duration;
        }
      }
    });

    // 2. Create Driver Map
    const driverMap = {};
    drivers.forEach((d) => {
      driverMap[d.driver_number] = {
        fullName: d.full_name,
        acronym: d.name_acronym,
        team: d.team_name,
        teamColor: d.team_colour, // OpenF1 gives hex codes here
        headshotUrl: d.headshot_url,
        countryCode: d.country_code,
      };
    });

    // 3. Build Standings Array
    // OpenF1 points in session_result are sometimes unreliable immediately,
    // but position is accurate. We rely on position.

    const standings = results
      .sort((a, b) => a.position - b.position)
      .map((result) => {
        const info = driverMap[result.driver_number] || {
          fullName: 'Unknown',
          team: 'Unknown',
        };
        const hasFastestLap = result.driver_number === fastestLapDriverNum;

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
          fastestLapTime: driverFastestLaps[result.driver_number] || null,
          gapToLeader: result.gap_to_leader || 0,
          time: result.time || 'DNF',
          headshotUrl: info.headshotUrl,
          countryCode: info.countryCode,
          dnf: result.dnf,
          dns: result.dns,
          dsq: result.dsq,
        };
      });

    return {
      sessionInfo: {
        circuit: session.circuit_short_name,
        location: session.location,
        country: session.country_name,
        date: session.date_start,
        name: session.session_name,
        fastestLapTime: fastestLapTime,
      },
      standings,
    };
  } catch (error) {
    console.error('Error in getLastRaceResults:', error.message);
    throw error;
  }
};

/**
 * Get details for the next upcoming race including schedule and weather forecast
 * @returns {Promise<{ circuit: string, sessions: object[], weather: object|null }|{ message: string, nextSeason: number }>}
 * @throws {Error} When the Jolpica schedule request fails
 */
export const getNextRace = async () => {
  try {
    // 1. Get Next Race Schedule from Jolpica (Ergast replacement)
    const scheduleRes = await axios.get(
      `${JOLPICA_URL}/current/next.json`,
      { timeout: 10_000 }
    );
    const raceData = scheduleRes.data.MRData.RaceTable.Races[0];

    if (!raceData) {
      return {
        message: 'Season finished',
        nextSeason: new Date().getFullYear() + 1,
      };
    }

    // 2. Extract Location for Weather
    const lat = raceData.Circuit.Location.lat;
    const long = raceData.Circuit.Location.long;
    const raceDateStr = raceData.date; // YYYY-MM-DD

    // 3. Fetch Weather from Open-Meteo (Free, no key needed)
    // We ask for daily max/min temp and max precipitation probability for the race day
    let weatherData = null;
    try {
      const weatherRes = await axios.get(
        OPEN_METEO_URL,
        {
          timeout: 10_000,
          params: {
            latitude: lat,
            longitude: long,
            daily:
              'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
            timezone: 'auto',
            start_date: raceDateStr,
            end_date: raceDateStr,
          },
        }
      );

      const daily = weatherRes.data.daily;
      if (daily) {
        weatherData = {
          tempMax: daily.temperature_2m_max[0],
          tempMin: daily.temperature_2m_min[0],
          precipProb: daily.precipitation_probability_max[0],
          weatherCode: daily.weather_code[0],
        };
      }
    } catch (wErr) {
      console.warn(
        'Weather fetch failed, continuing without weather:',
        wErr.message
      );
    }

    // 4. Helper to construct sessions with estimated end times
    const createSession = (name, dateStr, timeStr, durationMinutes) => {
      const start = new Date(`${dateStr}T${timeStr}`);
      const end = new Date(start.getTime() + durationMinutes * 60000);
      return {
        sessionName: name,
        sessionType: name.includes('Practice')
          ? 'Practice'
          : name.includes('Qualifying')
          ? 'Qualifying'
          : 'Race',
        dateStart: start.toISOString(),
        dateEnd: end.toISOString(),
      };
    };

    // 5. Build Sessions List
    const sessions = [];
    // Standard durations (approximate)
    if (raceData.FirstPractice)
      sessions.push(
        createSession(
          'Practice 1',
          raceData.FirstPractice.date,
          raceData.FirstPractice.time,
          SESSION_DURATION.PRACTICE
        )
      );
    if (raceData.SecondPractice)
      sessions.push(
        createSession(
          'Practice 2',
          raceData.SecondPractice.date,
          raceData.SecondPractice.time,
          SESSION_DURATION.PRACTICE
        )
      );
    if (raceData.ThirdPractice)
      sessions.push(
        createSession(
          'Practice 3',
          raceData.ThirdPractice.date,
          raceData.ThirdPractice.time,
          SESSION_DURATION.PRACTICE
        )
      );
    if (raceData.SprintQualifying)
      sessions.push(
        createSession(
          'Sprint Qualifying',
          raceData.SprintQualifying.date,
          raceData.SprintQualifying.time,
          SESSION_DURATION.SPRINT_QUALIFYING
        )
      );
    if (raceData.Sprint)
      sessions.push(
        createSession(
          'Sprint',
          raceData.Sprint.date,
          raceData.Sprint.time,
          SESSION_DURATION.SPRINT
        )
      );
    if (raceData.Qualifying)
      sessions.push(
        createSession(
          'Qualifying',
          raceData.Qualifying.date,
          raceData.Qualifying.time,
          SESSION_DURATION.QUALIFYING
        )
      );

    // Race (usually 2 hours window)
    sessions.push(createSession('Race', raceData.date, raceData.time, SESSION_DURATION.RACE));

    // Sort by time
    sessions.sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart));

    return {
      circuit: raceData.Circuit.circuitName,
      location: raceData.Circuit.Location.locality,
      country: raceData.Circuit.Location.country,
      raceDate: `${raceData.date}T${raceData.time}`,
      meetingKey: raceData.round, // Using round number as key
      sessions: sessions,
      weather: weatherData,
    };
  } catch (error) {
    console.error('Error fetching next race:', error.message);
    throw error;
  }
};

/**
 * Get list of all drivers from the most recent race session
 * @returns {Promise<object[]>} Array of driver objects; returns empty array on error
 */
export const getDriverList = async () => {
  try {
    const session = await getLatestRaceSession();
    if (!session) return [];

    const res = await axios.get(
      `${OPENF1_URL}/drivers?session_key=${session.session_key}`
    );

    // Dedup drivers
    const seen = new Set();
    return res.data
      .filter((d) => {
        if (seen.has(d.driver_number)) return false;
        seen.add(d.driver_number);
        return true;
      })
      .map((d) => ({
        number: d.driver_number,
        name: d.full_name,
        acronym: d.name_acronym,
        team: d.team_name,
        headshotUrl: d.headshot_url,
      }));
  } catch (error) {
    return [];
  }
};

/**
 * Get driver statistics aggregated across the current season
 * Includes DNF count and average starting grid position per driver
 * Fetches all completed race sessions in parallel via Promise.allSettled
 * @returns {Promise<{ season: number, stats: object[] }>}
 * @throws {Error} When the initial sessions fetch fails
 */
export const getDriverStats = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const now = new Date();

    // Fetch all race sessions from OpenF1
    const sessions = await cachedFetch(
      `sessions-race-${currentYear}`,
      async () => {
        const r = await axios.get(
          `${OPENF1_URL}/sessions?session_name=Race&year=${currentYear}`
        );
        return r.data;
      },
      60
    ) || [];

    // Filter for completed races only
    const completedRaces = sessions.filter((s) => new Date(s.date_start) < now);

    if (completedRaces.length === 0) {
      return { season: currentYear, stats: [] };
    }

    // Aggregate stats per driver — fetch all races in parallel
    const driverStats = {};

    const settledRaces = await Promise.allSettled(
      completedRaces.map((session) =>
        Promise.all([
          cachedFetch(
            `session-result-${session.session_key}`,
            async () => {
              const r = await axios.get(
                `${OPENF1_URL}/session_result?session_key=${session.session_key}`
              );
              return r.data;
            },
            60
          ),
          cachedFetch(
            `drivers-${session.session_key}`,
            async () => {
              const r = await axios.get(
                `${OPENF1_URL}/drivers?session_key=${session.session_key}`
              );
              return r.data;
            },
            300
          ),
          cachedFetch(
            `position-${session.session_key}`,
            async () => {
              const r = await axios.get(
                `${OPENF1_URL}/position?session_key=${session.session_key}`
              );
              return r.data;
            },
            5
          ),
        ])
      )
    );

    settledRaces.forEach((settled, i) => {
      if (settled.status === 'rejected') {
        console.warn(
          `Error fetching results for session ${completedRaces[i].session_key}:`,
          settled.reason?.message
        );
        return;
      }

      const [results, drivers, positionData] = settled.value;

      if (!results || results.length === 0) return;

      // Create driver map for team info
      const driverMap = {};
      drivers.forEach((d) => {
        driverMap[d.driver_number] = {
          fullName: d.full_name,
          acronym: d.name_acronym,
          team: d.team_name,
          teamColor: d.team_colour,
        };
      });

      // Process each result
      results.forEach((result) => {
        const driverInfo = driverMap[result.driver_number];
        if (!driverInfo) return;

        const driverKey = driverInfo.acronym;

        if (!driverStats[driverKey]) {
          driverStats[driverKey] = {
            driver: driverInfo.fullName,
            driverAcronym: driverInfo.acronym,
            driverNumber: result.driver_number,
            team: driverInfo.team,
            teamColor: driverInfo.teamColor,
            dnfCount: 0,
            totalRaces: 0,
            gridPositions: [],
          };
        }

        driverStats[driverKey].totalRaces++;

        // Count DNFs (using OpenF1's dnf, dns, dsq flags)
        if (result.dnf || result.dns || result.dsq) {
          driverStats[driverKey].dnfCount++;
        }

        // Track grid positions for averaging
        const startPositions = positionData?.filter(
          (p) =>
            p.driver_number === result.driver_number && p.position !== null
        );
        if (startPositions && startPositions.length > 0) {
          const gridPos = startPositions[0].position;
          if (gridPos && gridPos > 0) {
            driverStats[driverKey].gridPositions.push(gridPos);
          }
        }
      });
    });

    // Calculate average grid position for each driver
    const stats = Object.values(driverStats).map((driver) => ({
      driver: driver.driver,
      driverAcronym: driver.driverAcronym,
      driverNumber: driver.driverNumber,
      team: driver.team,
      teamColor: driver.teamColor,
      dnfCount: driver.dnfCount,
      totalRaces: driver.totalRaces,
      averageGridPosition:
        driver.gridPositions.length > 0
          ? driver.gridPositions.reduce((a, b) => a + b, 0) /
            driver.gridPositions.length
          : null,
    }));

    // Sort by driver acronym for consistency
    stats.sort((a, b) => a.driverAcronym.localeCompare(b.driverAcronym));

    return { season: currentYear, stats };
  } catch (error) {
    console.error('Error fetching driver stats:', error.message);
    throw error;
  }
};

/**
 * Get constructor win counts for the current season
 * Fetches all race results and driver info in parallel per race to avoid N+1 queries
 * @returns {Promise<{ season: number, wins: object[] }>}
 * @throws {Error} When the initial sessions fetch fails
 */
export const getConstructorWins = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const now = new Date();

    // Fetch all race sessions from OpenF1
    const sessions = await cachedFetch(
      `sessions-race-${currentYear}`,
      async () => {
        const r = await axios.get(
          `${OPENF1_URL}/sessions?session_name=Race&year=${currentYear}`
        );
        return r.data;
      },
      60
    ) || [];

    // Filter for completed races only
    const completedRaces = sessions.filter((s) => new Date(s.date_start) < now);

    if (completedRaces.length === 0) {
      return { season: currentYear, wins: [] };
    }

    // Count wins per constructor — fetch results + drivers in parallel for all races
    const constructorWins = {};

    const settledRaces = await Promise.allSettled(
      completedRaces.map((session) =>
        Promise.all([
          cachedFetch(
            `session-result-${session.session_key}`,
            async () => {
              const r = await axios.get(
                `${OPENF1_URL}/session_result?session_key=${session.session_key}`
              );
              return r.data;
            },
            60
          ),
          cachedFetch(
            `drivers-${session.session_key}`,
            async () => {
              const r = await axios.get(
                `${OPENF1_URL}/drivers?session_key=${session.session_key}`
              );
              return r.data;
            },
            300
          ),
        ])
      )
    );

    settledRaces.forEach((settled, i) => {
      const session = completedRaces[i];

      if (settled.status === 'rejected') {
        console.warn(
          `[getConstructorWins] Error fetching session ${session.session_key}:`,
          settled.reason?.message
        );
        return;
      }

      const [results, drivers] = settled.value;

      if (!results || results.length === 0) {
        console.warn(
          `[getConstructorWins] No results for session ${session.session_key} (${session.location})`
        );
        return;
      }

      // Find the winner (position 1)
      const winner = results.find((r) => r.position === 1);
      if (!winner) {
        console.warn(
          `[getConstructorWins] No winner found for session ${session.session_key}`
        );
        return;
      }

      // Look up team from pre-fetched driver list (eliminates the N+1 sequential fetch)
      const driverMap = {};
      drivers.forEach((d) => {
        driverMap[d.driver_number] = d;
      });

      const winnerDriver = driverMap[winner.driver_number];
      if (!winnerDriver) {
        console.warn(
          `[getConstructorWins] No driver info for winner ${winner.driver_number} in session ${session.session_key}`
        );
        return;
      }

      const teamName = winnerDriver.team_name;

      if (!constructorWins[teamName]) {
        constructorWins[teamName] = {
          team: teamName,
          teamColor: getTeamColor(teamName),
          wins: 0,
        };
      }

      constructorWins[teamName].wins++;
    });

    const wins = Object.values(constructorWins);

    // Sort by wins descending
    wins.sort((a, b) => b.wins - a.wins);

    return { season: currentYear, wins };
  } catch (error) {
    console.error('Error fetching constructor wins:', error.message);
    throw error;
  }
};

/**
 * Get per-driver finishing positions across all completed races in the current season
 * Arrays are aligned by race index so chart rendering can directly zip races and positions.
 * Races are fetched in parallel; results are processed in chronological order.
 * @returns {Promise<{ season: number, races: string[], drivers: object[] }>}
 * @throws {Error} When the initial sessions fetch fails
 */
export const getDriverRacePositions = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const now = new Date();

    // Fetch all race sessions from OpenF1
    const sessions = await cachedFetch(
      `sessions-race-${currentYear}`,
      async () => {
        const r = await axios.get(
          `${OPENF1_URL}/sessions?session_name=Race&year=${currentYear}`
        );
        return r.data;
      },
      60
    ) || [];

    // Filter for completed races only and sort by date
    const completedRaces = sessions
      .filter((s) => new Date(s.date_start) < now)
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));

    if (completedRaces.length === 0) {
      return { season: currentYear, races: [], drivers: [] };
    }

    const driverData = {};
    const raceNames = [];

    // Fetch all races in parallel, then process in sorted date order to preserve alignment
    const settledRaces = await Promise.allSettled(
      completedRaces.map((session) =>
        Promise.all([
          cachedFetch(
            `session-result-${session.session_key}`,
            async () => {
              const r = await axios.get(
                `${OPENF1_URL}/session_result?session_key=${session.session_key}`
              );
              return r.data;
            },
            60
          ),
          cachedFetch(
            `drivers-${session.session_key}`,
            async () => {
              const r = await axios.get(
                `${OPENF1_URL}/drivers?session_key=${session.session_key}`
              );
              return r.data;
            },
            300
          ),
        ])
      )
    );

    // completedRaces is already sorted by date_start — process in that order
    settledRaces.forEach((settled, i) => {
      const session = completedRaces[i];

      if (settled.status === 'rejected') {
        console.warn(
          `Error fetching results for session ${session.session_key} (${session.circuit_short_name}):`,
          settled.reason?.message
        );
        // Skip this race — don't add to raceNames or positions
        return;
      }

      const [results, drivers] = settled.value;

      if (!results || results.length === 0) {
        console.warn(`No results for ${session.circuit_short_name}, skipping`);
        return;
      }

      // Only add race name after confirming results exist
      raceNames.push(session.circuit_short_name);

      // Create driver map for team colors
      const driverMap = {};
      drivers.forEach((d) => {
        driverMap[d.driver_number] = {
          fullName: d.full_name,
          acronym: d.name_acronym,
          teamColor: d.team_colour,
        };
      });

      // Pre-initialize new drivers with nulls for all previous races
      drivers.forEach((d) => {
        const driverKey = d.name_acronym;
        if (!driverData[driverKey]) {
          driverData[driverKey] = {
            driverName: d.full_name,
            driverAcronym: d.name_acronym,
            teamColor: d.team_colour,
            positions: new Array(raceNames.length - 1).fill(null),
          };
        }
      });

      // Pad existing drivers who weren't in this race with null
      Object.keys(driverData).forEach((key) => {
        while (driverData[key].positions.length < raceNames.length) {
          driverData[key].positions.push(null);
        }
      });

      // Update actual finishing positions
      results.forEach((result) => {
        const driverInfo = driverMap[result.driver_number];
        if (!driverInfo) return;

        const driverKey = driverInfo.acronym;
        const position =
          result.dnf || result.dns || result.dsq ? null : result.position;

        driverData[driverKey].positions[raceNames.length - 1] = position;
      });
    });

    const drivers = Object.values(driverData);

    return {
      season: currentYear,
      races: raceNames,
      drivers: drivers,
    };
  } catch (error) {
    console.error('Error fetching driver race positions:', error.message);
    throw error;
  }
};
