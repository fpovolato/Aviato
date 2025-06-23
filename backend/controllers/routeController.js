const Route = require("../models/Route");

exports.createRoute = async (req, res) => {
  try {
    const { departureAirport, arrivalAirport, code } = req.body;
    const route = await Route.create({ departureAirport, arrivalAirport, code });
    res.status(201).json(route);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getRoutes = async (req, res) => {
  const routes = await Route.find().populate("departureAirport arrivalAirport");
  res.json(routes);
};

exports.getRouteById = async (req, res) => {
  const route = await Route.findById(req.params.id).populate("departureAirport arrivalAirport");
  if (!route) return res.status(404).json({ message: "Route not found" });
  res.json(route);
};

exports.deleteRoute = async (req, res) => {
  await Route.findByIdAndDelete(req.params.id);
  res.json({ message: "Route deleted" });
};