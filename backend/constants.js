// --- API BASE URLS ---
const OPENF1_URL = 'https://api.openf1.org/v1';
const JOLPICA_URL = 'https://api.jolpi.ca/ergast/f1';
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

// --- RATE LIMITING ---
const MIN_REQUEST_DELAY = 300; // ms between queued API requests

// --- CACHE TTL (milliseconds) ---
const TTL = {
  LIVE: 30_000,        // 30s  — live session data (positions, etc.)
  RACE: 300_000,       // 5min — completed race results (immutable)
  STANDINGS: 600_000,  // 10min — championship standings
  SCHEDULE: 3_600_000, // 1hr  — race schedule / next race
};

// --- F1 POINTS SYSTEM ---
const POINTS_MAP = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
};

// --- SESSION DURATIONS (minutes) ---
const SESSION_DURATION = {
  PRACTICE: 60,
  SPRINT_QUALIFYING: 45,
  SPRINT: 60,
  QUALIFYING: 60,
  RACE: 120,
};

module.exports = {
  OPENF1_URL,
  JOLPICA_URL,
  OPEN_METEO_URL,
  MIN_REQUEST_DELAY,
  TTL,
  POINTS_MAP,
  SESSION_DURATION,
};
