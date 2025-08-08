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
 * summary: Register a new user
 * description: Creates a new user and returns basic profile info with a JWT in response body. Cookies are set only on login.
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
 *           roles:
 *             type: array
 *             items: { type: string, enum: [customer, employee, admin] }
 *           airlines:
 *             type: array
 *             items: { type: string }
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

		const user = await User.create({
			name,
			surname,
			birthDate,
			email,
			password,
			roles: Array.isArray(roles) && roles.length > 0 ? roles : undefined,
			airlines:
				Array.isArray(airlines) && airlines.length > 0 ? airlines : undefined,
		});

		res.status(201).json({
			_id: user._id,
			name: user.name,
			surname: user.surname,
			email: user.email,
			roles: user.roles,
			token: generateToken(user._id),
		});
	} catch (error) {
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
 * summary: List users (admin only)
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
		if (role) filter.roles = role;
		if (airline) filter.airlines = airline;
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
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });
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
		if (!role || !["customer", "employee", "admin"].includes(role)) {
			return res.status(400).json({ message: "Invalid or missing role" });
		}
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });
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
};
