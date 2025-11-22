// Handles API request/response logic by calling the Service layer
const f1Service = require("../services/f1Service");

// Controller for /api/f1/last-race
exports.getLastRaceResults = async (req, res) => {
  try {
    const data = await f1Service.getLastRaceResults();
    res.json(data);
  } catch (error) {
    console.error("Controller Error (getLastRaceResults):", error.message);
    res
      .status(500)
      .json({
        message: "Internal Server Error: Could not retrieve last race data.",
      });
  }
};

// Controller for /api/f1/standings/drivers
exports.getDriverStandings = async (req, res) => {
  try {
    const data = await f1Service.getDriverStandings();
    res.json(data);
  } catch (error) {
    console.error("Controller Error (getDriverStandings):", error.message);
    res
      .status(500)
      .json({
        message: "Internal Server Error: Could not retrieve driver standings.",
      });
  }
};

// Controller for /api/f1/standings/constructors
exports.getConstructorStandings = async (req, res) => {
  try {
    const data = await f1Service.getConstructorStandings();
    res.json(data);
  } catch (error) {
    console.error("Controller Error (getConstructorStandings):", error.message);
    res
      .status(500)
      .json({
        message:
          "Internal Server Error: Could not retrieve constructor standings.",
      });
  }
};

// Controller for /api/f1/next-race
exports.getNextRace = async (req, res) => {
  try {
    const data = await f1Service.getNextRace();
    res.json(data);
  } catch (error) {
    console.error("Controller Error (getNextRace):", error.message);
    res
      .status(500)
      .json({
        message: "Internal Server Error: Could not retrieve next race data.",
      });
  }
};

// Controller for /api/f1/drivers
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await f1Service.getDriverList();
    res.json(drivers);
  } catch (error) {
    console.error("Controller Error (getDrivers):", error.message);
    res
      .status(500)
      .json({
        message: "Internal Server Error: Could not retrieve driver list.",
      });
  }
};

// Controller for /api/f1/driver-stats
exports.getDriverStats = async (req, res) => {
  try {
    const stats = await f1Service.getDriverStats();
    res.json(stats);
  } catch (error) {
    console.error("Controller Error (getDriverStats):", error.message);
    res
      .status(500)
      .json({
        message: "Internal Server Error: Could not retrieve driver stats.",
      });
  }
};

// Controller for /api/f1/constructor-wins
exports.getConstructorWins = async (req, res) => {
  try {
    const wins = await f1Service.getConstructorWins();
    res.json(wins);
  } catch (error) {
    console.error("Controller Error (getConstructorWins):", error.message);
    res
      .status(500)
      .json({
        message: "Internal Server Error: Could not retrieve constructor wins.",
      });
  }
};
