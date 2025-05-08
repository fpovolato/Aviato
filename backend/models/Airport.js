const mongoose = require("mongoose");

// Schema and data from OpenFlights
// https://openflights.org/data.php
const airportSchema = new mongoose.Schema(
  {
    // Unique OpenFlights identifier for this airport
    airportId: {
      type: Number,
      required: true,
      unique: true,
    },

    // Name of the airport (may or may not contain the city name)
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Main city served by airport
    city: {
      type: String,
      required: true,
      trim: true,
    },

    // Country or territory, ideally ISO 3166-1 code or full name
    country: {
      type: String,
      required: true,
      trim: true,
    },

    // 3-letter IATA code (null if not assigned)
    iata: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,
    },

    // 4-letter ICAO code (null if not assigned)
    icao: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,
    },

    // Geographic coordinates
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },

    // Altitude in feet
    altitude: {
      type: Number,
      required: true,
    },

    // Hours offset from UTC (e.g., 5.5 for India)
    timezone: {
      type: Number,
      required: true,
    },

    // Daylight savings time indicator
    dst: {
      type: String,
      enum: ["E", "A", "S", "O", "Z", "N", "U"],
      required: true,
    },

    // TZ database timezone (Olson format)
    tzDatabaseTimezone: {
      type: String,
      required: true,
      trim: true,
    },

    // Type of the facility
    type: {
      type: String,
      enum: ["airport", "station", "port", "unknown"],
      required: true,
    },

    // Source of data
    source: {
      type: String,
      enum: ["OurAirports", "Legacy", "User"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Airport", airportSchema);
