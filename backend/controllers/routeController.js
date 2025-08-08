const Route = require("../models/Route");

/**
 * @openapi
 * tags: [Routes]
 * summary: Create a route
 * security: [{ cookieAuth: [] }]
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required: [departureAirport, arrivalAirport]
 *         properties:
 *           departureAirport: { type: string }
 *           arrivalAirport: { type: string }
 *           code: { type: string }
 */
exports.createRoute = async (req, res) => {
	try {
		const { departureAirport, arrivalAirport, code } = req.body;

		// Check if route code already exists
		const existingRoute = await Route.findOne({ code });
		if (existingRoute) {
			return res.status(400).json({ message: "Route code already exists" });
		}

		// Validate that airports exist
		const Airport = require("../models/Airport");
		const [depAirport, arrAirport] = await Promise.all([
			Airport.findById(departureAirport),
			Airport.findById(arrivalAirport),
		]);

		if (!depAirport || !arrAirport) {
			return res
				.status(404)
				.json({ message: "One or both airports not found" });
		}

		const route = await Route.create({
			departureAirport,
			arrivalAirport,
			code,
		});
		const populatedRoute = await Route.findById(route._id).populate(
			"departureAirport arrivalAirport"
		);
		res.status(201).json(populatedRoute);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

/**
 * @openapi
 * tags: [Routes]
 * summary: List routes
 */
exports.getRoutes = async (req, res) => {
	const routes = await Route.find().populate("departureAirport arrivalAirport");
	res.json(routes);
};

/**
 * @openapi
 * tags: [Routes]
 * summary: Get route by id
 * parameters:
 *   - in: path
 *     name: id
 *     required: true
 *     schema: { type: string }
 */
exports.getRouteById = async (req, res) => {
	const route = await Route.findById(req.params.id).populate(
		"departureAirport arrivalAirport"
	);
	if (!route) return res.status(404).json({ message: "Route not found" });
	res.json(route);
};

/**
 * @openapi
 * tags: [Routes]
 * summary: Delete route
 * security: [{ cookieAuth: [] }]
 * parameters:
 *   - in: path
 *     name: id
 *     required: true
 *     schema: { type: string }
 */
exports.deleteRoute = async (req, res) => {
	await Route.findByIdAndDelete(req.params.id);
	res.json({ message: "Route deleted" });
};
