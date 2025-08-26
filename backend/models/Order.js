const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
	flight: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Flight",
		required: true,
	},
	// Informazioni complete del volo salvate durante il checkout
	flightInfo: {
		flightNumber: String,
		from: String,
		to: String,
		departureDate: String,
		arrivalDate: String,
		airline: {
			name: String,
			code: String,
		},
		price: Number,
		firstClassPrice: Number,
		additionalLuggagePrice: Number,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
	},
	priceAtPurchase: {
		type: Number,
		required: true,
		min: 0,
	},
	additionalLuggage: {
		type: Number,
		default: 0,
		min: 0,
	},
	additionalLuggagePrice: {
		type: Number,
		default: 0,
		min: 0,
	},
	seatClass: {
		type: String,
		enum: ["economy", "first"],
		default: "economy",
	},
	passengers: {
		type: Number,
		default: 1,
		min: 1,
	},
	// Posti selezionati per ogni passeggero
	selectedSeats: [
		{
			passengerNumber: {
				type: Number,
				required: true,
				min: 1,
			},
			seatRow: {
				type: String,
				required: true,
			},
			seatNumber: {
				type: Number,
				required: true,
			},
			seatClass: {
				type: String,
				enum: ["economy", "first"],
				required: true,
			},
			price: {
				type: Number,
				required: true,
				min: 0,
			},
		},
	],
});

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		items: [orderItemSchema],
		total: {
			type: Number,
			required: true,
			min: 0,
		},
		status: {
			type: String,
			enum: ["Pending", "Completed", "Cancelled", "Refunded"],
			default: "Pending",
		},
		paymentMethod: {
			type: String,
			enum: ["Credit Card", "PayPal", "Bank Transfer"],
			required: true,
		},
		paymentDetails: {
			type: mongoose.Mixed,
		},
		purchasedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Order", orderSchema);
