const express = require("express");
const router = express.Router();
const { getDashboardAnalytics, getAirlineAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");

// Get dashboard analytics (for all employees)
/**
 * @openapi
 * /api/analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Get analytics for employee dashboard
 *     security: [{ cookieAuth: [] }]
 */
router.get("/dashboard", protect, getDashboardAnalytics);

// Get airline-specific analytics (for airline employees)
/**
 * @openapi
 * /api/analytics/airline/{airlineId}:
 *   get:
 *     tags: [Analytics]
 *     summary: Get analytics for a specific airline
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: airlineId
 *         required: true
 *         schema: { type: string }
 */
router.get("/airline/:airlineId", protect, getAirlineAnalytics);

module.exports = router;
