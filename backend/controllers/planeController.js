const Plane = require("../models/Plane");

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

		// Genera automaticamente la configurazione dei posti
		plane.generateSeatsConfiguration();
		await plane.save();

		res.status(201).json(plane);
	} catch (error) {
		console.error("❌ Error in createPlane:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

const getPlanes = async (req, res) => {
	try {
		const planes = await Plane.find().populate("airline", "name code");
		res.json(planes);
	} catch (error) {
		console.error("❌ Error in getPlanes:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

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

// Nuovo metodo per ottenere la configurazione dei posti di un piano
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

// Nuovo metodo per aggiornare la configurazione di un piano
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

		// Aggiorna la configurazione
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

		// Rigenera la configurazione dei posti
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

// Nuovo metodo per ottenere le statistiche di un piano
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
