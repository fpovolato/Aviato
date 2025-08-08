const express = require("express");
const router = express.Router();
const {
	createRoute,
	getRoutes,
	getRouteById,
	deleteRoute,
} = require("../controllers/routeController");
const { protect, adminOnly, employeeOrAdmin } = require("../middleware/auth");

/**
 * @openapi
 * /api/routes:
 *   post:
 *     tags: [Routes]
 *     summary: Create a route
 *     security: [{ cookieAuth: [] }]
 */
router.post("/", protect, employeeOrAdmin, createRoute);
/**
 * @openapi
 * /api/routes:
 *   get:
 *     tags: [Routes]
 *     summary: List routes
 */
router.get("/", getRoutes);
/**
 * @openapi
 * /api/routes/{id}:
 *   get:
 *     tags: [Routes]
 *     summary: Get route by id
 */
router.get("/:id", getRouteById);
/**
 * @openapi
 * /api/routes/{id}:
 *   delete:
 *     tags: [Routes]
 *     summary: Delete route
 *     security: [{ cookieAuth: [] }]
 */
router.delete("/:id", protect, adminOnly, deleteRoute);

module.exports = router;
