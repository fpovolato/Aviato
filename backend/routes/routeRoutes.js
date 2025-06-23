const express = require("express");
const router = express.Router();
const {
	createRoute,
	getRoutes,
	getRouteById,
	deleteRoute,
} = require("../controllers/routeController");
const { protect, adminOnly, employeeOrAdmin } = require("../middleware/auth");

router.post("/", protect, employeeOrAdmin, createRoute);
router.get("/", getRoutes);
router.get("/:id", getRouteById);
router.delete("/:id", protect, adminOnly, deleteRoute);

module.exports = router;
