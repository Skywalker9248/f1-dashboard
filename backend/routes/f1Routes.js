// Maps URLs to Controller methods
const express = require('express');
const f1HomeController = require('../controllers/f1HomeController');

const router = express.Router();

// Last race results
router.get('/last-race', f1HomeController.getLastRaceResults);

// Driver championship standings
router.get('/standings/drivers', f1HomeController.getDriverStandings);

// Constructor championship standings
router.get('/standings/constructors', f1HomeController.getConstructorStandings);

// Next race details
router.get('/next-race', f1HomeController.getNextRace);

// Drivers list for the selector
router.get('/drivers', f1HomeController.getDrivers);

// Legacy endpoint for backward compatibility
router.get('/home', f1HomeController.getLastRaceResults);

module.exports = router;