const express = require("express");
const router = express.Router();
const {
	createFlight,
	getFlights,
	getFlightById,
	getFlightsByAirline,
	updateFlight,
	deleteFlight,
	updateFlightStatus,
	searchFlights,
} = require("../controllers/flightController");
const { protect, adminOnly, employeeOrAdmin } = require("../middleware/auth");

router.post("/", protect, employeeOrAdmin, createFlight);
router.get("/", getFlights);
router.get("/search", searchFlights);
router.get("/:id", getFlightById);
router.put("/:id", protect, adminOnly, updateFlight);
router.delete("/:id", protect, adminOnly, deleteFlight);
router.get("/airline/:airlineId", protect, getFlightsByAirline);
router.patch("/:id/status", protect, adminOnly, updateFlightStatus);

module.exports = router;
