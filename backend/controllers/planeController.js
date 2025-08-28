const Plane = require("../models/Plane");

/**
 * @openapi
 * tags: [Planes]
 * summary: Create plane and auto-generate seats configuration
 * security: [{ cookieAuth: [] }]
 */
const createPlane = async (req, res) => {
	const {
		code,
		manifacturer,
		model,
		seats,
		airlineId,
		totalRows,
		maxSeatsPerRow,
		cabinConfiguration,
		hasWiFi,
		hasEntertainment,
		hasPowerOutlets,
	} = req.body;

	try {
		const planeExists = await Plane.findOne({ code });
		if (planeExists) {
			return res.status(400).json({ message: "Plane already exists" });
		}

		// Scope: employee/manager can only create planes for their airline
		const requester = req.user;
		const isAdmin = requester.roles.includes("admin");
		if (!isAdmin) {
			const allowedAirlineIds = (requester.airlines || []).map((a) =>
				a.toString()
			);
			if (!allowedAirlineIds.includes(String(airlineId))) {
				return res
					.status(403)
					.json({ message: "Access denied for this airline" });
			}
		}

		const plane = await Plane.create({
			code,
			manifacturer,
			model,
			seats,
			airline: airlineId,
			totalRows,
			maxSeatsPerRow,
			cabinConfiguration,
			hasWiFi,
			hasEntertainment,
			hasPowerOutlets,
		});

		plane.generateSeatsConfiguration();
		await plane.save();

		res.status(201).json(plane);
	} catch (error) {
		console.error("❌ Error in createPlane:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Planes]
 * summary: List planes
 */
const getPlanes = async (req, res) => {
	try {
		const planes = await Plane.find().populate("airline", "name code");
		res.json(planes);
	} catch (error) {
		console.error("❌ Error in getPlanes:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Planes]
 * summary: Get plane by id
 */
const getPlaneById = async (req, res) => {
	try {
		const plane = await Plane.findById(req.params.id).populate(
			"airline",
			"name code"
		);

		if (plane) {
			res.json(plane);
		} else {
			res.status(404).json({ message: "Plane not found" });
		}
	} catch (error) {
		console.error("❌ Error in getPlaneById:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Planes]
 * summary: Get plane by code
 */
const getPlaneByCode = async (req, res) => {
	const { code } = req.params;

	try {
		const plane = await Plane.findOne({ code }).populate(
			"airline",
			"name code"
		);
		if (plane) {
			res.json(plane);
		} else {
			res.status(404).json({ message: "Plane not found" });
		}
	} catch (error) {
		console.error("❌ Error in getPlaneByCode:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Planes]
 * summary: List planes by airline
 */
const getPlanesByAirline = async (req, res) => {
	const { airlineId } = req.params;

	try {
		const planes = await Plane.find({ airline: airlineId }).populate(
			"airline",
			"name code"
		);
		res.json(planes);
	} catch (error) {
		console.error("❌ Error in getPlanesByAirline:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Planes]
 * summary: Get seat configuration for a plane
 */
const getPlaneSeats = async (req, res) => {
	try {
		const plane = await Plane.findById(req.params.id);

		if (!plane) {
			return res.status(404).json({ message: "Plane not found" });
		}

		const seatsByRows = plane.getSeatsByRows();
		const stats = plane.getSeatsStats();

		res.json({
			plane: {
				id: plane._id,
				code: plane.code,
				model: plane.model,
				manifacturer: plane.manifacturer,
				totalRows: plane.totalRows,
				maxSeatsPerRow: plane.maxSeatsPerRow,
				cabinConfiguration: plane.cabinConfiguration,
			},
			seats: seatsByRows,
			stats,
		});
	} catch (error) {
		console.error("❌ Error in getPlaneSeats:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Planes]
 * summary: Update plane configuration and regenerate seats
 * security: [{ cookieAuth: [] }]
 */
const updatePlaneConfiguration = async (req, res) => {
	try {
		const {
			totalRows,
			maxSeatsPerRow,
			cabinConfiguration,
			hasWiFi,
			hasEntertainment,
			hasPowerOutlets,
		} = req.body;

		const plane = await Plane.findById(req.params.id);

		if (!plane) {
			return res.status(404).json({ message: "Plane not found" });
		}

		plane.totalRows = totalRows || plane.totalRows;
		plane.maxSeatsPerRow = maxSeatsPerRow || plane.maxSeatsPerRow;
		plane.cabinConfiguration = cabinConfiguration || plane.cabinConfiguration;
		plane.hasWiFi = hasWiFi !== undefined ? hasWiFi : plane.hasWiFi;
		plane.hasEntertainment =
			hasEntertainment !== undefined
				? hasEntertainment
				: plane.hasEntertainment;
		plane.hasPowerOutlets =
			hasPowerOutlets !== undefined ? hasPowerOutlets : plane.hasPowerOutlets;

		plane.generateSeatsConfiguration();
		await plane.save();

		res.json({
			message: "Plane configuration updated successfully",
			plane,
		});
	} catch (error) {
		console.error("❌ Error in updatePlaneConfiguration:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Planes]
 * summary: Get seating stats for a plane
 */
const getPlaneStats = async (req, res) => {
	try {
		const plane = await Plane.findById(req.params.id);

		if (!plane) {
			return res.status(404).json({ message: "Plane not found" });
		}

		const stats = plane.getSeatsStats();
		const seatsByRows = plane.getSeatsByRows();

		res.json({
			plane: {
				id: plane._id,
				code: plane.code,
				model: plane.model,
				manifacturer: plane.manifacturer,
			},
			stats,
			cabinConfiguration: plane.cabinConfiguration,
			totalRows: Object.keys(seatsByRows).length,
		});
	} catch (error) {
		console.error("❌ Error in getPlaneStats:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

module.exports = {
	createPlane,
	getPlanes,
	getPlaneById,
	getPlaneByCode,
	getPlanesByAirline,
	getPlaneSeats,
	updatePlaneConfiguration,
	getPlaneStats,
};
