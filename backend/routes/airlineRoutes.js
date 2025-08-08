const express = require("express");
const router = express.Router();
const {
  createAirline,
  getAirlines,
  getAirlineById,
  inviteEmployee,
  getAllEmployees,
  getEmployeesByAirline,
} = require("../controllers/airlineController");
const { protect, adminOnly } = require("../middleware/auth");

/**
 * @openapi
 * /api/airlines:
 *   post:
 *     tags: [Airlines]
 *     summary: Create airline
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       201: { description: Created }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.post("/", protect, adminOnly, createAirline);
/**
 * @openapi
 * /api/airlines/invite:
 *   post:
 *     tags: [Airlines]
 *     summary: Invite a user as airline employee
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Invitation successful }
 */
router.post("/invite", protect, inviteEmployee);

/**
 * @openapi
 * /api/airlines:
 *   get:
 *     tags: [Airlines]
 *     summary: List airlines
 *     responses:
 *       200: { description: OK }
 */
router.get("/", getAirlines);
/**
 * @openapi
 * /api/airlines/employees/all:
 *   get:
 *     tags: [Airlines]
 *     summary: List all airline employees (admin)
 *     security: [{ cookieAuth: [] }]
 */
router.get("/employees/all", protect, adminOnly, getAllEmployees);
/**
 * @openapi
 * /api/airlines/employees/{airlineId}:
 *   get:
 *     tags: [Airlines]
 *     summary: List employees for an airline
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: airlineId
 *         required: true
 *         schema: { type: string }
 */
router.get("/employees/:airlineId", protect, getEmployeesByAirline);
/**
 * @openapi
 * /api/airlines/{id}:
 *   get:
 *     tags: [Airlines]
 *     summary: Get airline by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.get("/:id", getAirlineById);

module.exports = router;
