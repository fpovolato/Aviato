const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const {
	generateRefreshToken,
	verifyRefreshToken,
	generateAccessToken,
} = require("../utils/tokenUtils");

/**
 * @openapi
 * tags: [Users]
 * summary: Public registration (customers only)
 * description: Creates a new customer account and returns basic profile info with a JWT in response body. Cookies are set only on login. Employees and managers must be created by an admin.
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required: [name, surname, birthDate, email, password]
 *         properties:
 *           name: { type: string }
 *           surname: { type: string }
 *           birthDate: { type: string, format: date }
 *           email: { type: string, format: email }
 *           password: { type: string, minLength: 8 }
 * responses:
 *   201: { description: User created }
 *   400: { description: User already exists }
 *   500: { description: Server error }
 */
const registerUser = async (req, res) => {
	const { name, surname, birthDate, email, password, roles, airlines } =
		req.body;

	try {
		const userExists = await User.findOne({ email });

		if (userExists)
			return res.status(400).json({ message: "User already exists" });

		const userData = {
			name,
			surname,
			birthDate,
			email,
			password,
		};

		// Only set roles and airlines if they are provided
		// This allows both public registration (customer) and admin-created users (any role)
		if (roles) {
			userData.roles = roles;
		}
		if (airlines) {
			userData.airlines = airlines;
		}

		console.log("🔍 Debug - Request body:", req.body);
		console.log("🔍 Debug - User data to create:", userData);

		const user = await User.create(userData);

		console.log("🔍 Debug - Created user roles:", user.roles);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			surname: user.surname,
			email: user.email,
			roles: user.roles,
			token: generateToken(user._id),
		});
	} catch (error) {
		console.error("❌ Error in registerUser:", error);
		res.status(500).json({ message: "Server error" });
	}
};

/**
 * @openapi
 * tags: [Users]
 * summary: Authenticate user & set auth cookies
 * description: Validates credentials and sets HTTP-only `accessToken` and `refreshToken` cookies; returns user profile.
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required: [email, password]
 *         properties:
 *           email: { type: string, format: email }
 *           password: { type: string }
 * responses:
 *   200: { description: Authenticated }
 *   401: { description: Invalid credentials }
 *   500: { description: Server error }
 */
const loginUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });

		if (user && (await user.matchPassword(password))) {
			const accessToken = generateToken(user._id);
			const refreshToken = generateRefreshToken(user._id);

			res
				.cookie("accessToken", accessToken, {
					httpOnly: true,
					sameSite: "strict",
					maxAge: 3600000, // 1 hour
				})
				.cookie("refreshToken", refreshToken, {
					httpOnly: true,
					sameSite: "strict",
					maxAge: 604800000, // 7 days
				})
				.json({
					_id: user._id,
					name: user.name,
					surname: user.surname,
					email: user.email,
					roles: user.roles,
					passwordMustChange: !!user.passwordMustChange,
				});
		} else {
			res.status(401).json({ message: "Invalid credentials" });
		}
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};

/**
 * @openapi
 * tags: [Users]
 * summary: Get current user profile
 * security: [{ cookieAuth: [] }]
 * responses:
 *   200: { description: OK }
 *   404: { description: User not found }
 */
const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.id)
			.select("-password")
			.populate("airlines", "name code");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Users]
 * summary: Refresh access token
 * description: Issues new access and refresh tokens using current refresh token cookie.
 * responses:
 *   200: { description: Tokens refreshed }
 *   401: { description: Invalid refresh token }
 */
const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies;
		const { id } = verifyRefreshToken(refreshToken);
		const newAccess = generateAccessToken(id);
		const newRefresh = generateRefreshToken(id);
		res
			.cookie("accessToken", newAccess, {
				httpOnly: true,
				sameSite: "strict",
				maxAge: 3600000, // 1 hour
			})
			.cookie("refreshToken", newRefresh, {
				httpOnly: true,
				sameSite: "strict",
				maxAge: 604800000, // 7 days
			})
			.sendStatus(200);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Users]
 * summary: Logout user
 * description: Clears auth cookies and returns success message.
 * security: [{ cookieAuth: [] }]
 * responses:
 *   200: { description: Logged out }
 */
const logoutUser = async (req, res) => {
	res
		.clearCookie("accessToken")
		.clearCookie("refreshToken")
		.status(200)
		.json({ message: "Logged out successfully" });
};

/**
 * @openapi
 * tags: [Users]
 * summary: List users (admin only) or employees for manager's airline
 * security: [{ cookieAuth: [] }]
 * parameters:
 *   - in: query
 *     name: role
 *     schema: { type: string, enum: [customer, employee, admin] }
 *   - in: query
 *     name: airline
 *     schema: { type: string }
 * responses:
 *   200: { description: OK }
 *   403: { description: Forbidden }
 */
const getAllUsers = async (req, res) => {
	try {
		const { role, airline } = req.query;
		const filter = {};

		// If user is a manager, they can only see employees from their airline
		if (
			req.user.roles.includes("manager") &&
			!req.user.roles.includes("admin")
		) {
			const managerAirlineIds = req.user.airlines.map((airline) =>
				airline.toString()
			);
			filter.airlines = { $in: managerAirlineIds };
			// Managers can only see employees, not other managers or admins
			filter.roles = { $in: ["employee"] };
		} else {
			// Admin can see all users with optional filters
			if (role) filter.roles = role;
			if (airline) filter.airlines = airline;
		}

		const users = await User.find(filter)
			.select("-password")
			.populate("airlines", "name code");
		res.json(users);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Users]
 * summary: Delete a user (admin only)
 * security: [{ cookieAuth: [] }]
 * parameters:
 *   - in: path
 *     name: id
 *     required: true
 *     schema: { type: string }
 * responses:
 *   200: { description: Deleted }
 *   404: { description: Not found }
 */
const deleteUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });

		// If user is a manager, they can only delete employees from their airline
		if (
			req.user.roles.includes("manager") &&
			!req.user.roles.includes("admin")
		) {
			// Check if the user to delete is an employee
			if (!user.roles.includes("employee")) {
				return res.status(403).json({
					message: "Managers can only delete employees",
				});
			}

			// Check if the employee belongs to manager's airline
			const managerAirlineIds = req.user.airlines.map((airline) =>
				airline.toString()
			);
			const userAirlineIds = user.airlines.map((airline) => airline.toString());

			const hasCommonAirline = managerAirlineIds.some((managerAirlineId) =>
				userAirlineIds.includes(managerAirlineId)
			);

			if (!hasCommonAirline) {
				return res.status(403).json({
					message: "You can only delete employees from your airline",
				});
			}
		}

		await User.findByIdAndDelete(req.params.id);
		res.json({ message: "User deleted" });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Users]
 * summary: Update user role (admin only)
 * security: [{ cookieAuth: [] }]
 * parameters:
 *   - in: path
 *     name: id
 *     required: true
 *     schema: { type: string }
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         properties:
 *           role: { type: string, enum: [customer, employee, admin] }
 * responses:
 *   200: { description: Updated }
 *   400: { description: Invalid role }
 */
const updateUserRole = async (req, res) => {
	try {
		const { role } = req.body;
		if (!role || !["customer", "employee", "manager", "admin"].includes(role)) {
			return res.status(400).json({ message: "Invalid or missing role" });
		}
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });

		// If user is a manager, they can only update employees from their airline
		if (
			req.user.roles.includes("manager") &&
			!req.user.roles.includes("admin")
		) {
			// Check if the user to update is an employee
			if (!user.roles.includes("employee")) {
				return res.status(403).json({
					message: "Managers can only update employees",
				});
			}

			// Check if the employee belongs to manager's airline
			const managerAirlineIds = req.user.airlines.map((airline) =>
				airline.toString()
			);
			const userAirlineIds = user.airlines.map((airline) => airline.toString());

			const hasCommonAirline = managerAirlineIds.some((managerAirlineId) =>
				userAirlineIds.includes(managerAirlineId)
			);

			if (!hasCommonAirline) {
				return res.status(403).json({
					message: "You can only update employees from your airline",
				});
			}

			// Managers can only promote employees to customer or keep them as employee
			if (role === "admin" || role === "manager") {
				return res.status(403).json({
					message: "Managers cannot promote to admin or manager roles",
				});
			}
		}

		user.roles = [role];
		if (role === "customer" || role === "admin") {
			user.airlines = [];
		}
		await user.save();
		res.json(user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Users]
 * summary: Update user airline and role (admin only)
 * security: [{ cookieAuth: [] }]
 * parameters:
 *   - in: path
 *     name: id
 *     required: true
 *     schema: { type: string }
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         properties:
 *           airlineId: { type: string }
 *           role: { type: string, enum: [customer, employee, admin] }
 * responses:
 *   200: { description: Updated }
 */
const updateUserAirlineAndRole = async (req, res) => {
	try {
		const { airlineId, role } = req.body;
		if (!role) return res.status(400).json({ message: "Missing role" });
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });
		user.roles = [role];
		if (role === "customer" || role === "admin") {
			user.airlines = [];
		} else if (airlineId) {
			user.airlines = [airlineId];
		}
		await user.save();
		res.json(user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Users]
 * summary: Admin creates a manager and its airline (invitation)
 * security: [{ cookieAuth: [] }]
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required: [email, temporaryPassword, airlineName, airlineCode]
 *         properties:
 *           email: { type: string, format: email }
 *           temporaryPassword: { type: string, minLength: 6 }
 *           airlineName: { type: string }
 *           airlineCode: { type: string }
 * responses:
 *   201: { description: Created }
 */
const Airline = require("../models/Airline");
const createManagerWithAirline = async (req, res) => {
	const { email, temporaryPassword, airlineName, airlineCode } = req.body;
	try {
		const existing = await User.findOne({ email });
		if (existing)
			return res.status(400).json({ message: "User already exists" });

		const existingAirline = await Airline.findOne({ code: airlineCode });
		if (existingAirline)
			return res.status(400).json({ message: "Airline code already exists" });

		// Create manager user with temp password and default values
		const manager = await User.create({
			name: "Manager", // Default name, will be updated at first login
			surname: "User", // Default surname, will be updated at first login
			birthDate: new Date(), // Default birth date, will be updated at first login
			email,
			password: temporaryPassword,
			roles: ["manager"],
			passwordMustChange: true,
			invitedBy: req.user._id,
		});

		try {
			const airline = await Airline.create({
				name: airlineName,
				code: airlineCode,
				manager: manager._id,
			});

			manager.airlines = [airline._id];
			await manager.save();

			return res.status(201).json({
				manager: {
					_id: manager._id,
					name: manager.name,
					surname: manager.surname,
					email: manager.email,
					roles: manager.roles,
					passwordMustChange: manager.passwordMustChange,
				},
				airline,
			});
		} catch (err) {
			// rollback manager if airline creation fails
			await User.findByIdAndDelete(manager._id);
			throw err;
		}
	} catch (error) {
		console.error("❌ Error in createManagerWithAirline:", error);
		return res
			.status(500)
			.json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Users]
 * summary: Manager creates an employee for their airline
 * security: [{ cookieAuth: [] }]
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required: [name, surname, birthDate, email, password]
 *         properties:
 *           name: { type: string }
 *           surname: { type: string }
 *           birthDate: { type: string, format: date }
 *           email: { type: string, format: email }
 *           password: { type: string, minLength: 8 }
 * responses:
 *   201: { description: Employee created }
 *   400: { description: User already exists }
 *   403: { description: Forbidden - not manager or admin }
 *   500: { description: Server error }
 */
const createEmployeeForManager = async (req, res) => {
	const { name, surname, birthDate, email, password } = req.body;
	try {
		const existing = await User.findOne({ email });
		if (existing)
			return res.status(400).json({ message: "User already exists" });

		// If user is a manager, they can only create employees for their airline
		let airlineId = null;
		if (
			req.user.roles.includes("manager") &&
			!req.user.roles.includes("admin")
		) {
			if (!req.user.airlines || req.user.airlines.length === 0) {
				return res.status(403).json({
					message: "Manager must be assigned to an airline",
				});
			}
			// Manager can only create employees for their airline
			airlineId = req.user.airlines[0];
		}

		const employee = await User.create({
			name,
			surname,
			birthDate,
			email,
			password,
			roles: ["employee"],
			airlines: airlineId ? [airlineId] : [],
			passwordMustChange: true,
			invitedBy: req.user._id,
		});

		return res.status(201).json({
			_id: employee._id,
			name: employee.name,
			surname: employee.surname,
			email: employee.email,
			roles: employee.roles,
			airlines: employee.airlines,
			passwordMustChange: employee.passwordMustChange,
		});
	} catch (error) {
		console.error("❌ Error in createEmployeeForManager:", error);
		return res
			.status(500)
			.json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Users]
 * summary: Complete first login (set password and profile)
 * security: [{ cookieAuth: [] }]
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required: [newPassword]
 *         properties:
 *           currentPassword: { type: string }
 *           newPassword: { type: string, minLength: 8 }
 *           name: { type: string }
 *           surname: { type: string }
 *           birthDate: { type: string, format: date }
 * responses:
 *   200: { description: Updated }
 */
const completeFirstLogin = async (req, res) => {
	try {
		const { currentPassword, newPassword, name, surname, birthDate } = req.body;
		const user = await User.findById(req.user.id);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (!user.passwordMustChange) {
			return res.status(400).json({ message: "First login already completed" });
		}

		if (!newPassword) {
			return res.status(400).json({ message: "Missing newPassword" });
		}

		if (currentPassword && !(await user.matchPassword(currentPassword))) {
			return res.status(400).json({ message: "Current password is incorrect" });
		}

		if (name) user.name = name;
		if (surname) user.surname = surname;
		if (birthDate) user.birthDate = birthDate;

		user.password = newPassword;
		user.passwordMustChange = false;
		await user.save();

		return res.status(200).json({ message: "Profile updated" });
	} catch (error) {
		console.error("❌ Error in completeFirstLogin:", error);
		return res
			.status(500)
			.json({ message: "Server error", error: error.message });
	}
};

module.exports = {
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
};
