const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyAccessToken } = require("../utils/tokenUtils");

const protect = async (req, res, next) => {
	const token = req.cookies.accessToken;

	if (!token) {
		return res.status(401).json({ message: "Not authorized, no token" });
	}

	try {
		const decoded = verifyAccessToken(token);
		req.user = await User.findById(decoded.id).select(
			"name email roles airlines"
		);
		next();
	} catch (error) {
		res.status(401).json({ message: "Not authorized, invalid token" });
	}
};

const adminOnly = (req, res, next) => {
	if (req.user && req.user.roles.includes("admin")) {
		next();
	} else {
		res.status(403).json({ message: "Admin access required" });
	}
};

const employeeOrAdmin = (req, res, next) => {
	if (
		req.user &&
		(req.user.roles.includes("admin") ||
			req.user.roles.includes("employee") ||
			req.user.roles.includes("manager"))
	) {
		next();
	} else {
		res
			.status(403)
			.json({ message: "Admin, employee, or manager access required" });
	}
};

const adminOrManager = (req, res, next) => {
	if (
		req.user &&
		(req.user.roles.includes("admin") || req.user.roles.includes("manager"))
	) {
		next();
	} else {
		res.status(403).json({ message: "Admin or manager access required" });
	}
};

module.exports = { protect, adminOnly, employeeOrAdmin, adminOrManager };
