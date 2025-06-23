const Airport = require("../models/Airport");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

// @desc    Create a new airport
// @route   POST /api/airports
// @access  Private
const createAirport = async (req, res) => {
	const {
		airportId,
		name,
		city,
		country,
		iata,
		icao,
		latitude,
		longitude,
		altitude,
		timezone,
		dst,
		tzDatabaseTimezone,
		type,
		source,
	} = req.body;

	try {
		const airportExists = await Airport.findOne({ airportId });

		if (airportExists) {
			return res.status(400).json({ message: "Airport already exists" });
		}

		const airport = await Airport.create({
			airportId,
			name,
			city,
			country,
			iata,
			icao,
			latitude,
			longitude,
			altitude,
			timezone,
			dst,
			tzDatabaseTimezone,
			type,
			source,
		});

		res.status(201).json(airport);
	} catch (error) {
		console.error("❌ Error in createAirport:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// @desc    Bulk create airports
// @route   POST /api/airports/bulk
// @access  Private
const bulkCreateAirports = async (req, res) => {
	const airports = req.body;

	try {
		const createdAirports = await Airport.insertMany(airports);
		res.status(201).json(createdAirports);
	} catch (error) {
		console.error("❌ Error in bulkCreateAirports:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// @desc    Get all airports
// @route   GET /api/airports
// @access  Private
const getAirports = async (req, res) => {
	try {
		const airports = await Airport.find();
		res.json(airports);
	} catch (error) {
		console.error("❌ Error in getAirports:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// @desc    Get airport by ID
// @route   GET /api/airports/:id
// @access  Private
const getAirportById = async (req, res) => {
	try {
		const airport = await Airport.findById(req.params.id);

		if (airport) {
			res.json(airport);
		} else {
			res.status(404).json({ message: "Airport not found" });
		}
	} catch (error) {
		console.error("❌ Error in getAirportById:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// @desc    Get airports by IATA code
// @route   GET /api/airports/iata/:iata
// @access  Private
const getAirportsByIata = async (req, res) => {
	const { iata } = req.params;

	try {
		const airports = await Airport.find({ iata });

		if (airports.length > 0) {
			res.json(airports);
		} else {
			res
				.status(404)
				.json({ message: "No airports found with the given IATA code" });
		}
	} catch (error) {
		console.error("❌ Error in getAirportsByIata:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

const getAirportsByIcao = async (req, res) => {
	const { icao } = req.params;

	try {
		const airports = await Airport.find({ icao });

		if (airports.length > 0) {
			res.json(airports);
		} else {
			res
				.status(404)
				.json({ message: "No airports found with the given ICAO code" });
		}
	} catch (error) {
		console.error("❌ Error in getAirportsByIcao:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

const getAirportsByCity = async (req, res) => {
	const { city } = req.params;

	try {
		const airports = await Airport.find({ city });
		if (airports.length > 0) {
			res.json(airports);
		} else {
			res.status(404).json({ message: "No airports found in the given city" });
		}
	} catch (error) {
		console.error("❌ Error in getAirportsByCity:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

const getAirportsByCountry = async (req, res) => {
	const { country } = req.params;

	try {
		const airports = await Airport.find({ country });
		if (airports.length > 0) {
			res.json(airports);
		} else {
			res
				.status(404)
				.json({ message: "No airports found in the given country" });
		}
	} catch (error) {
		console.error("❌ Error in getAirportsByCountry:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// @desc    Autocomplete airports
// @route   GET /api/airports/search?q=...
// @access  Public
const searchAirports = async (req, res) => {
	const { q } = req.query;
	if (!q || q.lenght < 2) {
		return res.json([]);
	}
	try {
		const regex = new RegExp(q, "i");
		const airports = await Airport.find({
			$or: [
				{ name: regex },
				{ city: regex },
				{ country: regex },
				{ iata: regex },
				{ icao: regex },
			],
		}).limit(10);
		res.json(airports);
	} catch (error) {
		console.error("❌ Error in searchAirports:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

const updateAirport = async (req, res) => {
	const { id } = req.params;
	const updates = req.body;

	try {
		const airport = await Airport.findByIdAndUpdate(id, updates, {
			new: true,
			runValidators: true,
		});
		if (airport) {
			res.json(airport);
		} else {
			res.status(404).json({ message: "Airport not found" });
		}
	} catch (error) {
		console.error("❌ Error in updateAirport:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

const deleteAirport = async (req, res) => {
	const { id } = req.params;

	try {
		const airport = await Airport.findByIdAndDelete(id);
		if (airport) {
			res.json({ message: "Airport deleted successfully" });
		} else {
			res.status(404).json({ message: "Airport not found" });
		}
	} catch (error) {
		console.error("❌ Error in deleteAirport:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * Importa in bulk gli aeroporti da un file CSV uploadato
 * (formato OpenFlights con colonne:
 *   airportId,name,city,country,iata,icao,latitude,longitude,altitude,timezone,dst,tzDatabaseTimezone,type,source
 * )
 */
const importAirportsFromCSV = async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ message: "Devi inviare un file CSV" });
	}

	const results = [];
	const filePath = path.resolve(req.file.path);

	fs.createReadStream(filePath)
		.pipe(
			csv({
				headers: [
					"airportId",
					"name",
					"city",
					"country",
					"iata",
					"icao",
					"latitude",
					"longitude",
					"altitude",
					"timezone",
					"dst",
					"tzDatabaseTimezone",
					"type",
					"source",
				],
				skipLines: 0,
			})
		)
		.on("data", (row) => {
			// Converti i campi numerici
			row.airportId = Number(row.airportId);
			row.latitude = parseFloat(row.latitude);
			row.longitude = parseFloat(row.longitude);
			row.altitude = Number(row.altitude);
			row.timezone = parseFloat(row.timezone);

			// Se iata/icao sono stringhe vuote, metti null
			if (!row.iata) row.iata = null;
			if (!row.icao) row.icao = null;

			results.push(row);
		})
		.on("end", async () => {
			try {
				// inserimento non‐ordinato: ignora eventuali duplicati già in db
				const inserted = await Airport.insertMany(results, { ordered: false });
				// cancella il file temporaneo
				fs.unlinkSync(filePath);
				res.status(201).json({ inserted: inserted.length });
			} catch (error) {
				console.error("❌ Error in importAirportsFromCSV:", error);
				fs.unlinkSync(filePath);
				res
					.status(500)
					.json({ message: "Import fallito", error: error.message });
			}
		})
		.on("error", (err) => {
			console.error("❌ CSV parse error:", err);
			fs.unlinkSync(filePath);
			res
				.status(400)
				.json({ message: "Errore nel parsing del CSV", error: err.message });
		});
};

module.exports = {
	createAirport,
	bulkCreateAirports,
	getAirports,
	getAirportById,
	getAirportsByIata,
	getAirportsByIcao,
	getAirportsByCity,
	getAirportsByCountry,
	updateAirport,
	deleteAirport,
	importAirportsFromCSV,
	searchAirports,
};
