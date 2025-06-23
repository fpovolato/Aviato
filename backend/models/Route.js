const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    departureAirport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Airport",
      required: true,
    },
    arrivalAirport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Airport",
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Route", routeSchema);