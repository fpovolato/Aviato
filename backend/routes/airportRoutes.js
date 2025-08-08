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

/**
 * @openapi
 * /api/airports:
 *   post:
 *     tags: [Airports]
 *     summary: Create airport
 *     security: [{ cookieAuth: [] }]
 */
router.post("/", protect, adminOnly, createAirport);
/**
 * @openapi
 * /api/airports/bulk:
 *   post:
 *     tags: [Airports]
 *     summary: Bulk create airports
 *     security: [{ cookieAuth: [] }]
 */
router.post("/bulk", protect, adminOnly, bulkCreateAirports);
// upload di un solo file CSV, campo form “file”
/**
 * @openapi
 * /api/airports/import-csv:
 *   post:
 *     tags: [Airports]
 *     summary: Import airports from CSV upload
 *     security: [{ cookieAuth: [] }]
 */
router.post(
	"/import-csv",
	protect,
	adminOnly,
	upload.single("file"),
	importAirportsFromCSV
);

/**
 * @openapi
 * /api/airports:
 *   get:
 *     tags: [Airports]
 *     summary: List airports
 */
router.get("/", getAirports);
/**
 * @openapi
 * /api/airports/search:
 *   get:
 *     tags: [Airports]
 *     summary: Autocomplete/search airports
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 */
router.get("/search", searchAirports);
/**
 * @openapi
 * /api/airports/iata/{iata}:
 *   get:
 *     tags: [Airports]
 *     summary: Get airports by IATA code
 */
router.get("/iata/:iata", getAirportsByIata);
/**
 * @openapi
 * /api/airports/icao/{icao}:
 *   get:
 *     tags: [Airports]
 *     summary: Get airports by ICAO code
 */
router.get("/icao/:icao", getAirportsByIcao);
/**
 * @openapi
 * /api/airports/country/{country}:
 *   get:
 *     tags: [Airports]
 *     summary: Get airports by country
 */
router.get("/country/:country", getAirportsByCountry);
/**
 * @openapi
 * /api/airports/city/{city}:
 *   get:
 *     tags: [Airports]
 *     summary: Get airports by city
 */
router.get("/city/:city", getAirportsByCity);
/**
 * @openapi
 * /api/airports/{id}:
 *   get:
 *     tags: [Airports]
 *     summary: Get airport by id
 */
router.get("/:id", getAirportById);

/**
 * @openapi
 * /api/airports/{id}:
 *   put:
 *     tags: [Airports]
 *     summary: Update airport
 *     security: [{ cookieAuth: [] }]
 */
router.put("/:id", protect, adminOnly, updateAirport);

/**
 * @openapi
 * /api/airports/{id}:
 *   delete:
 *     tags: [Airports]
 *     summary: Delete airport
 *     security: [{ cookieAuth: [] }]
 */
router.delete("/:id", protect, adminOnly, deleteAirport);

module.exports = router;
