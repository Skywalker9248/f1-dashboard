// Handles API request/response logic by calling the Service layer
import * as f1Service from '../services/f1Service.js';

// Controller for /api/f1/last-race
export const getLastRaceResults = async (c) => {
  try {
    const data = await f1Service.getLastRaceResults();
    return c.json(data);
  } catch (error) {
    console.error('Controller Error (getLastRaceResults):', error.message);
    return c.json({
      message: 'Internal Server Error: Could not retrieve last race data.',
    }, 500);
  }
};

// Controller for /api/f1/standings/drivers
export const getDriverStandings = async (c) => {
  try {
    const data = await f1Service.getDriverStandings();
    return c.json(data);
  } catch (error) {
    console.error('Controller Error (getDriverStandings):', error.message);
    return c.json({
      message: 'Internal Server Error: Could not retrieve driver standings.',
    }, 500);
  }
};

// Controller for /api/f1/standings/constructors
export const getConstructorStandings = async (c) => {
  try {
    const data = await f1Service.getConstructorStandings();
    return c.json(data);
  } catch (error) {
    console.error('Controller Error (getConstructorStandings):', error.message);
    return c.json({
      message:
        'Internal Server Error: Could not retrieve constructor standings.',
    }, 500);
  }
};

// Controller for /api/f1/next-race
export const getNextRace = async (c) => {
  try {
    const data = await f1Service.getNextRace();
    return c.json(data);
  } catch (error) {
    console.error('Controller Error (getNextRace):', error.message);
    return c.json({
      message: 'Internal Server Error: Could not retrieve next race data.',
    }, 500);
  }
};

// Controller for /api/f1/drivers
export const getDrivers = async (c) => {
  try {
    const drivers = await f1Service.getDriverList();
    return c.json(drivers);
  } catch (error) {
    console.error('Controller Error (getDrivers):', error.message);
    return c.json({
      message: 'Internal Server Error: Could not retrieve driver list.',
    }, 500);
  }
};

// Controller for /api/f1/driver-stats
export const getDriverStats = async (c) => {
  try {
    const stats = await f1Service.getDriverStats();
    return c.json(stats);
  } catch (error) {
    console.error('Controller Error (getDriverStats):', error.message);
    return c.json({
      message: 'Internal Server Error: Could not retrieve driver stats.',
    }, 500);
  }
};

// Controller for /api/f1/constructor-wins
export const getConstructorWins = async (c) => {
  try {
    const wins = await f1Service.getConstructorWins();
    return c.json(wins);
  } catch (error) {
    console.error('Controller Error (getConstructorWins):', error.message);
    return c.json({
      message: 'Internal Server Error: Could not retrieve constructor wins.',
    }, 500);
  }
};

// Controller for /api/f1/driver-race-positions
export const getDriverRacePositions = async (c) => {
  try {
    const positions = await f1Service.getDriverRacePositions();
    return c.json(positions);
  } catch (error) {
    console.error('Controller Error (getDriverRacePositions):', error.message);
    return c.json({
      message:
        'Internal Server Error: Could not retrieve driver race positions.',
    }, 500);
  }
};
