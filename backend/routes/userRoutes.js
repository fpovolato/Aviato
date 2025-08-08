const express = require("express");
const router = express.Router();
const {
	registerUser,
	loginUser,
	getProfile,
	refreshToken,
	logoutUser,
	getAllUsers,
	deleteUser,
	updateUserRole,
	updateUserAirlineAndRole,
	createManagerWithAirline,
	createEmployeeForManager,
	completeFirstLogin,
} = require("../controllers/userController");
const { protect, adminOnly, adminOrManager } = require("../middleware/auth");

/**
 * @openapi
 * /api/users/register:
 *   post:
 *     tags: [Users]
 *     summary: Register a new user
 *     description: Creates a user account and returns basic profile information.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, surname, birthDate, email, password]
 *             properties:
 *               name: { type: string }
 *               surname: { type: string }
 *               birthDate: { type: string, format: date }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               roles:
 *                 type: array
 *                 items: { type: string, enum: [customer, employee, admin] }
 *               airlines:
 *                 type: array
 *                 items: { type: string, description: Airline ObjectId }
 *     responses:
 *       201: { description: User created }
 *       400: { description: User already exists or validation error }
 *       500: { description: Server error }
 */
router.post("/register", registerUser);

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     tags: [Users]
 *     summary: Authenticate user and set session cookies
 *     description: On success, sets HTTP-only access and refresh token cookies and returns user profile.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Authenticated }
 *       401: { description: Invalid credentials }
 *       500: { description: Server error }
 */
router.post("/login", loginUser);

/**
 * @openapi
 * /api/users/refresh:
 *   post:
 *     tags: [Users]
 *     summary: Refresh access token
 *     description: Reads refresh token cookie and issues new access and refresh tokens.
 *     security: []
 *     responses:
 *       200: { description: Tokens refreshed }
 *       401: { description: Invalid or missing refresh token }
 *       500: { description: Server error }
 */
router.post("/refresh", refreshToken);

/**
 * @openapi
 * /api/users/logout:
 *   post:
 *     tags: [Users]
 *     summary: Logout current user
 *     description: Clears access and refresh token cookies.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200: { description: Logged out successfully }
 */
router.post("/logout", protect, logoutUser);

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401: { description: Unauthorized }
 *       404: { description: User not found }
 */
router.get("/profile", protect, getProfile);

// Admin and manager user management
/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users (admin sees all, manager sees only their airline's employees)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [customer, employee, admin] }
 *       - in: query
 *         name: airline
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of users }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get("/", protect, getAllUsers);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: User not found }
 */
router.delete("/:id", protect, adminOrManager, deleteUser);

/**
 * @openapi
 * /api/users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Update user role
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [customer, employee, admin] }
 *     responses:
 *       200: { description: Updated user }
 *       400: { description: Invalid role }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: User not found }
 */
router.patch("/:id/role", protect, adminOrManager, updateUserRole);

/**
 * @openapi
 * /api/users/{id}/airline-role:
 *   patch:
 *     tags: [Users]
 *     summary: Update user airline and role
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               airlineId: { type: string }
 *               role: { type: string, enum: [customer, employee, admin] }
 *     responses:
 *       200: { description: Updated user }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: User not found }
 */
router.patch("/:id/airline-role", protect, adminOnly, updateUserAirlineAndRole);

/**
 * @openapi
 * /api/users/managers:
 *   post:
 *     tags: [Users]
 *     summary: Create manager and airline (admin)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.post("/managers", protect, adminOnly, createManagerWithAirline);

/**
 * @openapi
 * /api/users/employees:
 *   post:
 *     tags: [Users]
 *     summary: Create employee for manager's airline
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.post("/employees", protect, adminOrManager, createEmployeeForManager);

/**
 * @openapi
 * /api/users/first-login:
 *   post:
 *     tags: [Users]
 *     summary: Complete first login (set new password)
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 */
router.post("/first-login", protect, completeFirstLogin);

module.exports = router;
