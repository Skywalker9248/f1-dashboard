// Maps URLs to Controller methods
import { Hono } from 'hono';
import * as f1HomeController from '../controllers/f1HomeController.js';

const f1Routes = new Hono();

// Last race results
f1Routes.get('/last-race', f1HomeController.getLastRaceResults);

// Driver championship standings
f1Routes.get('/standings/drivers', f1HomeController.getDriverStandings);

// Constructor championship standings
f1Routes.get('/standings/constructors', f1HomeController.getConstructorStandings);

// Next race details
f1Routes.get('/next-race', f1HomeController.getNextRace);

// Drivers list for the selector
f1Routes.get('/drivers', f1HomeController.getDrivers);

// Driver statistics
f1Routes.get('/driver-stats', f1HomeController.getDriverStats);

// Constructor wins
f1Routes.get('/constructor-wins', f1HomeController.getConstructorWins);

// Driver race positions across all races
f1Routes.get('/driver-race-positions', f1HomeController.getDriverRacePositions);

// Legacy endpoint for backward compatibility
f1Routes.get('/home', f1HomeController.getLastRaceResults);

export default f1Routes;
