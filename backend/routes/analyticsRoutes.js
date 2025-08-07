const express = require("express");
const router = express.Router();
const { getDashboardAnalytics, getAirlineAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");

// Get dashboard analytics (for all employees)
router.get("/dashboard", protect, getDashboardAnalytics);

// Get airline-specific analytics (for airline employees)
router.get("/airline/:airlineId", protect, getAirlineAnalytics);

module.exports = router;
