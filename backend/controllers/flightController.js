const mongoose = require("mongoose");
const Flight = require("../models/Flight");
const Airport = require("../models/Airport");
const Airline = require("../models/Airline");
const Plane = require("../models/Plane");

const createFlight = async (req, res) => {
  const {
    flightNumber,
    departureAirport,
    arrivalAirport,
    departureDate,
    arrivalDate,
    airline,
    plane,
    status,
    price,
    firstClassPrice,
    additionalLuggagePrice,
  } = req.body;

  try {
    if (await Flight.findOne({ flightNumber })) {
      return res.status(400).json({ message: "Flight already exists" });
    }

    const ids = [departureAirport, arrivalAirport, airline];
    if (plane) ids.push(plane);
    if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "Invalid reference ID format" });
    }

    const [dep, arr, al, pl] = await Promise.all([
      Airport.findById(departureAirport),
      Airport.findById(arrivalAirport),
      Airline.findById(airline),
      plane ? Plane.findById(plane) : Promise.resolve(true),
    ]);
    if (!dep || !arr || !al || (plane && !pl)) {
      return res.status(404).json({ message: "Referenced entity not found" });
    }

    if (new Date(arrivalDate) <= new Date(departureDate)) {
      return res
        .status(400)
        .json({ message: "arrivalDate must be after departureDate" });
    }

    const flightData = {
      flightNumber,
      departureAirport,
      arrivalAirport,
      departureDate,
      arrivalDate,
      airline,
      plane,
      price,
      firstClassPrice,
      additionalLuggagePrice,
    };
    if (status) flightData.status = status;

    const flight = await Flight.create(flightData);

    const fullFlight = await Flight.findById(flight._id).populate(
      "departureAirport arrivalAirport airline plane",
      "name code flightNumber"
    );
    return res.status(201).json(fullFlight);
  } catch (error) {
    console.error("❌ Error in createFlight:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getFlights = async (req, res) => {
  try {
    const flights = await Flight.find()
      .populate({
        path: "departureAirport",
        select: "name city country iata icao tzDatabaseTimezone",
      })
      .populate({
        path: "arrivalAirport",
        select: "name city country iata icao tzDatabaseTimezone",
      })
      .populate({
        path: "airline",
        select: "name code",
      })
      .populate({
        path: "plane",
        select: "code manifacturer model seats",
      })
      .sort({ departureDate: 1 });

    const flightWithDuration = flights.map((flight) => {
      const obj = flight.toObject();
      const ms = new Date(obj.arrivalDate) - new Date(obj.departureDate);
      const totalMinutes = Math.floor(ms / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      obj.duration = `${hours}h ${minutes}m`;
      return obj;
    });
    return res.status(200).json(flightWithDuration);
  } catch (error) {
    console.error("❌ Error in getFlights:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate({
        path: "departureAirport",
        select: "name city country iata icao tzDatabaseTimezone",
      })
      .populate({
        path: "arrivalAirport",
        select: "name city country iata icao tzDatabaseTimezone",
      })
      .populate({
        path: "airline",
        select: "name code",
      })
      .populate({
        path: "plane",
        select: "code manifacturer model seats",
      });
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }
    const obj = flight.toObject();
    const ms = new Date(obj.arrivalDate) - new Date(obj.departureDate);
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    obj.duration = `${hours}h ${minutes}m`;
    return res.status(200).json(obj);
  } catch (error) {
    console.error("❌ Error in getFlightById:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getFlightsByAirline = async (req, res) => {
  try {
    const flights = await Flight.find({ airline: req.params.id })
      .populate({
        path: "departureAirport",
        select: "name city country iata icao tzDatabaseTimezone",
      })
      .populate({
        path: "arrivalAirport",
        select: "name city country iata icao tzDatabaseTimezone",
      })
      .populate({
        path: "airline",
        select: "name code",
      })
      .populate({
        path: "plane",
        select: "code manifacturer model seats",
      });
    if (!flights) {
      return res.status(404).json({ message: "Flights not found" });
    }
    const flightWithDuration = flights.map((flight) => {
      const obj = flight.toObject();
      const ms = new Date(obj.arrivalDate) - new Date(obj.departureDate);
      const totalMinutes = Math.floor(ms / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      obj.duration = `${hours}h ${minutes}m`;
      return obj;
    });
    return res.status(200).json(flightWithDuration);
  } catch (error) {
    console.error("❌ Error in getFlightsByAirline:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const updateFlight = async (req, res) => {
  const {
    flightNumber,
    departureAirport,
    arrivalAirport,
    departureDate,
    arrivalDate,
    airline,
    plane,
    status,
    price,
    firstClassPrice,
    additionalLuggagePrice,
  } = req.body;

  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    const ids = [departureAirport, arrivalAirport, airline];
    if (plane) ids.push(plane);
    if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "Invalid reference ID format" });
    }

    const [dep, arr, al, pl] = await Promise.all([
      Airport.findById(departureAirport),
      Airport.findById(arrivalAirport),
      Airline.findById(airline),
      plane ? Plane.findById(plane) : Promise.resolve(true),
    ]);
    if (!dep || !arr || !al || (plane && !pl)) {
      return res.status(404).json({ message: "Referenced entity not found" });
    }

    if (new Date(arrivalDate) <= new Date(departureDate)) {
      return res
        .status(400)
        .json({ message: "arrivalDate must be after departureDate" });
    }

    const flightData = {
      flightNumber,
      departureAirport,
      arrivalAirport,
      departureDate,
      arrivalDate,
      airline,
      plane,
      price,
      firstClassPrice,
      additionalLuggagePrice,
    };
    if (status) flightData.status = status;

    Object.assign(flight, flightData);
    await flight.save();

    const fullFlight = await Flight.findById(flight._id).populate(
      "departureAirport arrivalAirport airline plane",
      "name code flightNumber"
    );
    return res.status(200).json(fullFlight);
  } catch (error) {
    console.error("❌ Error in updateFlight:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }
    return res.status(200).json({ message: "Flight deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteFlight:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createFlight,
  getFlights,
  getFlightById,
  getFlightsByAirline,
  updateFlight,
  deleteFlight,
};
