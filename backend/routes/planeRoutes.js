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

/**
 * @openapi
 * /api/planes:
 *   post:
 *     tags: [Planes]
 *     summary: Create plane
 *     security: [{ cookieAuth: [] }]
 */
router.post("/", protect, adminOnly, createPlane);
/**
 * @openapi
 * /api/planes:
 *   get:
 *     tags: [Planes]
 *     summary: List planes
 */
router.get("/", getPlanes);
/**
 * @openapi
 * /api/planes/{id}:
 *   get:
 *     tags: [Planes]
 *     summary: Get plane by id
 */
router.get("/:id", getPlaneById);
/**
 * @openapi
 * /api/planes/code/{code}:
 *   get:
 *     tags: [Planes]
 *     summary: Get plane by code
 */
router.get("/code/:code", getPlaneByCode);
/**
 * @openapi
 * /api/planes/airline/{airlineId}:
 *   get:
 *     tags: [Planes]
 *     summary: Get planes by airline
 */
router.get("/airline/:airlineId", getPlanesByAirline);

// Nuove routes per la gestione dei posti
/**
 * @openapi
 * /api/planes/{id}/seats:
 *   get:
 *     tags: [Planes]
 *     summary: Get seat configuration for plane
 */
router.get("/:id/seats", getPlaneSeats);
/**
 * @openapi
 * /api/planes/{id}/stats:
 *   get:
 *     tags: [Planes]
 *     summary: Get seating stats for plane
 */
router.get("/:id/stats", getPlaneStats);
/**
 * @openapi
 * /api/planes/{id}/configuration:
 *   put:
 *     tags: [Planes]
 *     summary: Update plane configuration
 *     security: [{ cookieAuth: [] }]
 */
router.put("/:id/configuration", protect, adminOnly, updatePlaneConfiguration);

module.exports = router;
