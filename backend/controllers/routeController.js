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
    const route = await Route.create({ departureAirport, arrivalAirport, code });
    res.status(201).json(route);
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
  const route = await Route.findById(req.params.id).populate("departureAirport arrivalAirport");
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