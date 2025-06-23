const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema(
	{
		flightNumber: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		route: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Route",
			required: true,
		},
		departureDate: {
			type: Date,
			required: true,
		},
		arrivalDate: {
			type: Date,
			required: true,
		},
		airline: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Airline",
			required: true,
		},
		plane: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Plane",
			required: true,
		},
		status: {
			type: String,
			enum: ["scheduled", "delayed", "cancelled", "departed", "landed"],
			default: "scheduled",
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		firstClassPrice: {
			type: Number,
			required: true,
			min: 0,
		},
		additionalLuggagePrice: {
			type: Number,
			default: 0,
			min: 0,
		},
		seatsAvailable: {
			type: Number,
			required: true,
			min: 0,
		},
	},
	{
		timestamps: true,
	}
);

flightSchema.index({ route: 1, departureDate: 1 });

module.exports = mongoose.model("Flight", flightSchema);
