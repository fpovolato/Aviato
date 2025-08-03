const express = require("express");
const router = express.Router();
const {
	createPlane,
	getPlanes,
	getPlaneById,
	getPlaneByCode,
	getPlanesByAirline,
	getPlaneSeats,
	updatePlaneConfiguration,
	getPlaneStats,
} = require("../controllers/planeController");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/", protect, adminOnly, createPlane);
router.get("/", getPlanes);
router.get("/:id", getPlaneById);
router.get("/code/:code", getPlaneByCode);
router.get("/airline/:airlineId", getPlanesByAirline);

// Nuove routes per la gestione dei posti
router.get("/:id/seats", getPlaneSeats);
router.get("/:id/stats", getPlaneStats);
router.put("/:id/configuration", protect, adminOnly, updatePlaneConfiguration);

module.exports = router;
