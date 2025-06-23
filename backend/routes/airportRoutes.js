const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
	createAirport,
	bulkCreateAirports,
	getAirports,
	getAirportById,
	getAirportsByIata,
	getAirportsByIcao,
	getAirportsByCountry,
	getAirportsByCity,
	updateAirport,
	deleteAirport,
	importAirportsFromCSV,
	searchAirports,
} = require("../controllers/airportController");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/", protect, adminOnly, createAirport);
router.post("/bulk", protect, adminOnly, bulkCreateAirports);
// upload di un solo file CSV, campo form “file”
router.post(
	"/import-csv",
	protect,
	adminOnly,
	upload.single("file"),
	importAirportsFromCSV
);

router.get("/", getAirports);
router.get("/search", searchAirports);
router.get("/iata/:iata", getAirportsByIata);
router.get("/icao/:icao", getAirportsByIcao);
router.get("/country/:country", getAirportsByCountry);
router.get("/city/:city", getAirportsByCity);
router.get("/:id", getAirportById);

router.put("/:id", protect, adminOnly, updateAirport);

router.delete("/:id", protect, adminOnly, deleteAirport);

module.exports = router;
