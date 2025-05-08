const express = require("express");
const router = express.Router();
const {
  createFlight,
  getFlights,
  getFlightById,
  getFlightsByAirline,
  updateFlight,
  deleteFlight,
} = require("../controllers/flightController");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/", protect, adminOnly, createFlight);
router.get("/", getFlights);
router.get("/:id", getFlightById);
router.put("/:id", protect, adminOnly, updateFlight);
router.delete("/:id", protect, adminOnly, deleteFlight);
router.get("/airline/:airlineId", protect, getFlightsByAirline);

module.exports = router;
