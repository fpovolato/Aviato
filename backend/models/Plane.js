const mongoose = require("mongoose");

const planeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  manifacturer: {
    type: String,
    required: true,
    trim: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  airline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Airline",
    required: true,
  },
  seats: {
    type: Number,
    required: true,
    min: 1,
  },
});

module.exports = mongoose.model("Plane", planeSchema);
