const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
	{
		row: {
			type: String,
			required: true,
			trim: true,
		},
		number: {
			type: Number,
			required: true,
			min: 1,
		},
		seatClass: {
			type: String,
			enum: ["economy", "first"],
			required: true,
			default: "economy",
		},
		isAvailable: {
			type: Boolean,
			default: true,
		},
		isReserved: {
			type: Boolean,
			default: false,
		},
	},
	{ _id: false }
);

const cabinConfigSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		seatClass: {
			type: String,
			enum: ["economy", "first"],
			required: true,
		},
		startRow: {
			type: String,
			required: true,
		},
		endRow: {
			type: String,
			required: true,
		},
		seatsPerRow: {
			type: Number,
			required: true,
			min: 1,
		},
		seatLayout: {
			type: String,
			required: true,
			// Esempio: "3-3" per 3 posti, corridoio, 3 posti
			// "2-2" per 2 posti, corridoio, 2 posti
			// "2-3-2" per 2 posti, corridoio, 3 posti, corridoio, 2 posti
		},
		priceMultiplier: {
			type: Number,
			default: 1.0,
			min: 0.1,
		},
	},
	{ _id: false }
);

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
	cabinConfiguration: {
		type: [cabinConfigSchema],
		required: true,
		validate: {
			validator: function (configs) {
				return configs.length > 0;
			},
			message: "At least one cabin configuration is required",
		},
	},
	seatsConfiguration: {
		type: [seatSchema],
		default: [],
	},
	totalRows: {
		type: Number,
		required: true,
		min: 1,
	},
	maxSeatsPerRow: {
		type: Number,
		required: true,
		min: 1,
	},
	hasWiFi: {
		type: Boolean,
		default: false,
	},
	hasEntertainment: {
		type: Boolean,
		default: false,
	},
	hasPowerOutlets: {
		type: Boolean,
		default: false,
	},
});

// Pre-save middleware to auto generate seat configuration
planeSchema.pre("save", function (next) {
	if (
		this.isModified("cabinConfiguration") ||
		this.seatsConfiguration.length === 0
	) {
		this.generateSeatsConfiguration();
	}
	next();
});

planeSchema.methods.generateSeatsConfiguration = function () {
	const seats = [];

	this.cabinConfiguration.forEach((config) => {
		const startRowNum = parseInt(config.startRow);
		const endRowNum = parseInt(config.endRow);

		for (let row = startRowNum; row <= endRowNum; row++) {
			const rowLetter = String.fromCharCode(64 + row); // A, B, C, etc.

			for (let seat = 1; seat <= config.seatsPerRow; seat++) {
				const seatData = {
					row: rowLetter,
					number: seat,
					seatClass: config.seatClass,
					isAvailable: true,
					isReserved: false,
				};
				seats.push(seatData);
			}
		}
	});

	this.seatsConfiguration = seats;
	return seats;
};

planeSchema.methods.getAvailableSeats = function () {
	return this.seatsConfiguration.filter(
		(seat) => seat.isAvailable && !seat.isReserved
	);
};

planeSchema.methods.getSeatsByClass = function (seatClass) {
	return this.seatsConfiguration.filter((seat) => seat.seatClass === seatClass);
};

planeSchema.methods.reserveSeat = function (row, number) {
	const seat = this.seatsConfiguration.find(
		(s) => s.row === row && s.number === number
	);
	if (seat && seat.isAvailable && !seat.isReserved) {
		seat.isReserved = true;
		return true;
	}
	return false;
};

planeSchema.methods.releaseSeat = function (row, number) {
	const seat = this.seatsConfiguration.find(
		(s) => s.row === row && s.number === number
	);
	if (seat && seat.isReserved) {
		seat.isReserved = false;
		return true;
	}
	return false;
};

planeSchema.methods.getSeatsByRows = function () {
	const seatsByRows = {};

	this.seatsConfiguration.forEach((seat) => {
		if (!seatsByRows[seat.row]) {
			seatsByRows[seat.row] = [];
		}
		seatsByRows[seat.row].push(seat);
	});

	Object.keys(seatsByRows).forEach((row) => {
		seatsByRows[row].sort((a, b) => a.number - b.number);
	});

	return seatsByRows;
};

planeSchema.methods.getSeatsStats = function () {
	const stats = {
		total: this.seatsConfiguration.length,
		available: 0,
		reserved: 0,
		economy: 0,
		first: 0,
	};

	this.seatsConfiguration.forEach((seat) => {
		if (seat.isAvailable && !seat.isReserved) stats.available++;
		if (seat.isReserved) stats.reserved++;
		if (seat.seatClass === "economy") stats.economy++;
		if (seat.seatClass === "first") stats.first++;
	});

	return stats;
};

module.exports = mongoose.model("Plane", planeSchema);
