const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const {
	generateRefreshToken,
	verifyRefreshToken,
	generateAccessToken,
} = require("../utils/tokenUtils");

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
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

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
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

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
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

// @desc    refresh access token
// @route   POST /api/users/refresh
// @access  Public
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

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Public
const logoutUser = async (req, res) => {
	res
		.clearCookie("accessToken")
		.clearCookie("refreshToken")
		.status(200)
		.json({ message: "Logged out successfully" });
};

// @desc    Get all users (admin only, with optional filters)
// @route   GET /api/users
// @access  Admin
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

// @desc    Delete a user (admin only)
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });
		res.json({ message: "User deleted" });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// @desc    Update user role (admin only)
// @route   PATCH /api/users/:id/role
// @access  Admin
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

// @desc    Update user airline and role (admin only)
// @route   PATCH /api/users/:id/airline-role
// @access  Admin
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
