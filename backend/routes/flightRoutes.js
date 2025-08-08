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

/**
 * @openapi
 * /api/flights:
 *   post:
 *     tags: [Flights]
 *     summary: Create a flight
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.post("/", protect, employeeOrAdmin, createFlight);
/**
 * @openapi
 * /api/flights:
 *   get:
 *     tags: [Flights]
 *     summary: List flights
 *     responses:
 *       200: { description: OK }
 */
router.get("/", getFlights);
/**
 * @openapi
 * /api/flights/search:
 *   get:
 *     tags: [Flights]
 *     summary: Search flights (direct and one-stop)
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string }
 *       - in: query
 *         name: to
 *         schema: { type: string }
 *       - in: query
 *         name: departureDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: departureDateEnd
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: returnDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: returnDateEnd
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Missing parameters }
 */
router.get("/search", searchFlights);
/**
 * @openapi
 * /api/flights/{id}:
 *   get:
 *     tags: [Flights]
 *     summary: Get flight by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.get("/:id", getFlightById);
/**
 * @openapi
 * /api/flights/{id}:
 *   put:
 *     tags: [Flights]
 *     summary: Update flight
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 */
router.put("/:id", protect, adminOnly, updateFlight);
/**
 * @openapi
 * /api/flights/{id}:
 *   delete:
 *     tags: [Flights]
 *     summary: Delete flight
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 */
router.delete("/:id", protect, adminOnly, deleteFlight);
/**
 * @openapi
 * /api/flights/airline/{airlineId}:
 *   get:
 *     tags: [Flights]
 *     summary: List flights by airline
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: airlineId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get("/airline/:airlineId", protect, getFlightsByAirline);
/**
 * @openapi
 * /api/flights/{id}/status:
 *   patch:
 *     tags: [Flights]
 *     summary: Update flight status
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 */
router.patch("/:id/status", protect, adminOnly, updateFlightStatus);

module.exports = router;
