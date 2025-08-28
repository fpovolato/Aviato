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
        // TODO: Feature not (yet) implemented
		specialRequests: {
			type: String,
			trim: true,
		},
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

seatReservationSchema.index({ user: 1, flight: 1 });

seatReservationSchema.index({ expiresAt: 1 });

seatReservationSchema.pre("save", function (next) {
	if (this.isNew && !this.expiresAt) {
		this.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
	}
	next();
});

seatReservationSchema.methods.isExpired = function () {
	return new Date() > this.expiresAt;
};

seatReservationSchema.methods.extendReservation = function (minutes = 15) {
	this.expiresAt = new Date(Date.now() + minutes * 60 * 1000);
	return this.save();
};

seatReservationSchema.methods.confirm = function () {
	this.status = "confirmed";
	this.expiresAt = null;
	return this.save();
};

seatReservationSchema.methods.cancel = function () {
	this.status = "cancelled";
	return this.save();
};

seatReservationSchema.statics.cleanExpiredReservations = async function () {
	const result = await this.deleteMany({
		expiresAt: { $lt: new Date() },
		status: "reserved",
	});
	return result.deletedCount;
};

seatReservationSchema.statics.getFlightReservations = function (flightId) {
	return this.find({
		flight: flightId,
		status: { $in: ["reserved", "confirmed"] },
	}).populate("user", "name email");
};

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
