const mongoose = require("mongoose");

const seatReservationSchema = new mongoose.Schema(
	{
		flight: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Flight",
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		plane: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Plane",
			required: true,
		},
		seatRow: {
			type: String,
			required: true,
			trim: true,
		},
		seatNumber: {
			type: Number,
			required: true,
			min: 1,
		},
		seatClass: {
			type: String,
			enum: ["economy", "first"],
			required: true,
		},
		status: {
			type: String,
			enum: ["reserved", "confirmed", "cancelled"],
			default: "reserved",
			required: true,
		},
		reservationDate: {
			type: Date,
			default: Date.now,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		// Note speciali (es. richieste speciali, disabilità, etc.)
		specialRequests: {
			type: String,
			trim: true,
		},
		// Timestamp per la scadenza della prenotazione (se non confermata)
		expiresAt: {
			type: Date,
			required: function() {
				return this.status === "reserved";
			},
		},
	},
	{
		timestamps: true,
	}
);

// Indice composto per evitare prenotazioni duplicate dello stesso posto
seatReservationSchema.index(
	{
		flight: 1,
		seatRow: 1,
		seatNumber: 1,
	},
	{ unique: true }
);

// Indice per le query per utente
seatReservationSchema.index({ user: 1, flight: 1 });

// Indice per le prenotazioni scadute
seatReservationSchema.index({ expiresAt: 1 });

// Pre-save middleware per impostare la data di scadenza
seatReservationSchema.pre("save", function (next) {
	if (this.isNew && !this.expiresAt) {
		// La prenotazione scade dopo 15 minuti se non confermata
		this.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
	}
	next();
});

// Metodo per verificare se la prenotazione è scaduta
seatReservationSchema.methods.isExpired = function () {
	return new Date() > this.expiresAt;
};

// Metodo per estendere la prenotazione
seatReservationSchema.methods.extendReservation = function (minutes = 15) {
	this.expiresAt = new Date(Date.now() + minutes * 60 * 1000);
	return this.save();
};

// Metodo per confermare la prenotazione
seatReservationSchema.methods.confirm = function () {
	this.status = "confirmed";
	this.expiresAt = null; // Rimuove la scadenza per le prenotazioni confermate
	return this.save();
};

// Metodo per cancellare la prenotazione
seatReservationSchema.methods.cancel = function () {
	this.status = "cancelled";
	return this.save();
};

// Metodo statico per pulire le prenotazioni scadute
seatReservationSchema.statics.cleanExpiredReservations = async function () {
	const result = await this.deleteMany({
		expiresAt: { $lt: new Date() },
		status: "reserved",
	});
	return result.deletedCount;
};

// Metodo statico per ottenere le prenotazioni di un volo
seatReservationSchema.statics.getFlightReservations = function (flightId) {
	return this.find({
		flight: flightId,
		status: { $in: ["reserved", "confirmed"] },
	}).populate("user", "name email");
};

// Metodo statico per verificare se un posto è disponibile
seatReservationSchema.statics.isSeatAvailable = async function (
	flightId,
	seatRow,
	seatNumber
) {
	const reservation = await this.findOne({
		flight: flightId,
		seatRow: seatRow,
		seatNumber: seatNumber,
		status: { $in: ["reserved", "confirmed"] },
	});

	return !reservation;
};

module.exports = mongoose.model("SeatReservation", seatReservationSchema);
