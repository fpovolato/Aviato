const mongoose = require("mongoose");

// Schema per un singolo posto
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
		isAisle: {
			type: Boolean,
			default: false,
		},
		isWindow: {
			type: Boolean,
			default: false,
		},
		isEmergencyExit: {
			type: Boolean,
			default: false,
		},
		isBulkhead: {
			type: Boolean,
			default: false,
		},
	},
	{ _id: false }
);

// Schema per la configurazione della cabina
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
	// Nuova configurazione per i posti a sedere
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
	// Posti specifici dell'aereo
	seatsConfiguration: {
		type: [seatSchema],
		default: [],
	},
	// Configurazione generale dell'aereo
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
	// Informazioni aggiuntive
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

// Pre-save middleware per generare automaticamente la configurazione dei posti
planeSchema.pre("save", function (next) {
	if (
		this.isModified("cabinConfiguration") ||
		this.seatsConfiguration.length === 0
	) {
		this.generateSeatsConfiguration();
	}
	next();
});

// Metodi per la gestione dei posti
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
					isAisle: this.isAisleSeat(seat, config.seatLayout),
					isWindow: this.isWindowSeat(seat, config.seatsPerRow),
					isEmergencyExit: this.isEmergencyExitRow(row),
					isBulkhead: this.isBulkheadRow(row, config),
				};
				seats.push(seatData);
			}
		}
	});

	this.seatsConfiguration = seats;
	return seats;
};

// Verifica se un posto è di corridoio
planeSchema.methods.isAisleSeat = function (seatNumber, layout) {
	const layoutArray = layout.split("-").map(Number);
	let currentSeat = 0;

	for (let i = 0; i < layoutArray.length; i++) {
		currentSeat += layoutArray[i];
		if (seatNumber === currentSeat || seatNumber === currentSeat + 1) {
			return true;
		}
	}
	return false;
};

// Verifica se un posto è finestrino
planeSchema.methods.isWindowSeat = function (seatNumber, seatsPerRow) {
	return seatNumber === 1 || seatNumber === seatsPerRow;
};

// Verifica se è una fila di uscita di emergenza
planeSchema.methods.isEmergencyExitRow = function (row) {
	// Logica per identificare le file di uscita di emergenza
	// Questo può variare per aereo
	return false;
};

// Verifica se è una fila bulkhead (prima fila di una sezione)
planeSchema.methods.isBulkheadRow = function (row, config) {
	return row === parseInt(config.startRow);
};

// Metodo per ottenere i posti disponibili
planeSchema.methods.getAvailableSeats = function () {
	return this.seatsConfiguration.filter(
		(seat) => seat.isAvailable && !seat.isReserved
	);
};

// Metodo per ottenere i posti per classe
planeSchema.methods.getSeatsByClass = function (seatClass) {
	return this.seatsConfiguration.filter((seat) => seat.seatClass === seatClass);
};

// Metodo per prenotare un posto
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

// Metodo per liberare un posto
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

// Metodo per ottenere la configurazione dei posti organizzata per file
planeSchema.methods.getSeatsByRows = function () {
	const seatsByRows = {};

	this.seatsConfiguration.forEach((seat) => {
		if (!seatsByRows[seat.row]) {
			seatsByRows[seat.row] = [];
		}
		seatsByRows[seat.row].push(seat);
	});

	// Ordina i posti per numero
	Object.keys(seatsByRows).forEach((row) => {
		seatsByRows[row].sort((a, b) => a.number - b.number);
	});

	return seatsByRows;
};

// Metodo per ottenere statistiche dei posti
planeSchema.methods.getSeatsStats = function () {
	const stats = {
		total: this.seatsConfiguration.length,
		available: 0,
		reserved: 0,
		economy: 0,
		first: 0,
		aisle: 0,
		window: 0,
		emergencyExit: 0,
		bulkhead: 0,
	};

	this.seatsConfiguration.forEach((seat) => {
		if (seat.isAvailable && !seat.isReserved) stats.available++;
		if (seat.isReserved) stats.reserved++;
		if (seat.seatClass === "economy") stats.economy++;
		if (seat.seatClass === "first") stats.first++;
		if (seat.isAisle) stats.aisle++;
		if (seat.isWindow) stats.window++;
		if (seat.isEmergencyExit) stats.emergencyExit++;
		if (seat.isBulkhead) stats.bulkhead++;
	});

	return stats;
};

module.exports = mongoose.model("Plane", planeSchema);
