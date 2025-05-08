const Plane = require("../models/Plane");
const Airline = require("../models/Airline");
const User = require("../models/User");

const createPlane = async (req, res) => {
  const { code, manifacturer, model, seats, airlineId } = req.body;

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
    });

    res.status(201).json(plane);
  } catch (error) {
    console.error("❌ Error in createPlane:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPlanes = async (req, res) => {
  try {
    const planes = await Plane.find();
    res.json(planes);
  } catch (error) {
    console.error("❌ Error in getPlanes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPlaneById = async (req, res) => {
  try {
    const plane = await Plane.findById(req.params.id);

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
    const plane = await Plane.findOne({ code });
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
    const planes = await Plane.find({ airline: airlineId });
    res.json(planes);
  } catch (error) {
    console.error("❌ Error in getPlanesByAirline:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createPlane,
  getPlanes,
  getPlaneById,
  getPlaneByCode,
  getPlanesByAirline,
};
