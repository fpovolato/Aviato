const Plane = require("../models/Plane");
const Flight = require("../models/Flight");
const SeatReservation = require("../models/SeatReservation");

/**
 * @openapi
 * tags: [Seats]
 * summary: Get seat map and pricing for a flight
 */
const getFlightSeats = async (req, res) => {
	try {
		const { flightId } = req.params;

		const flight = await Flight.findById(flightId).populate({
			path: "plane",
			select: "cabinConfiguration seatsConfiguration totalRows maxSeatsPerRow",
		});

		if (!flight) {
			return res.status(404).json({ message: "Flight not found" });
		}

		const reservations = await SeatReservation.find({
			flight: flightId,
			status: { $in: ["reserved", "confirmed"] },
		});

		const occupiedSeats = new Map();
		reservations.forEach((reservation) => {
			const key = `${reservation.seatRow}-${reservation.seatNumber}`;
			occupiedSeats.set(key, {
				status: reservation.status,
				userId: reservation.user,
				price: reservation.price,
			});
		});

		const seatsByRows = flight.plane.getSeatsByRows();

		Object.keys(seatsByRows).forEach((row) => {
			seatsByRows[row].forEach((seat) => {
				const key = `${seat.row}-${seat.number}`;
				const reservation = occupiedSeats.get(key);

				if (reservation) {
					seat.isReserved = true;
					seat.reservationStatus = reservation.status;
					seat.reservedBy = reservation.userId;
					seat.price = reservation.price;
				} else {
					seat.isReserved = false;
					seat.reservationStatus = null;
					seat.reservedBy = null;
					const basePrice =
						seat.seatClass === "first" ? flight.firstClassPrice : flight.price;
					seat.price = Math.round(basePrice * 0.1 * 100) / 100;
				}
			});
		});

		const stats = flight.plane.getSeatsStats();

		res.json({
			flight: {
				id: flight._id,
				flightNumber: flight.flightNumber,
				departureDate: flight.departureDate,
				arrivalDate: flight.arrivalDate,
				price: flight.price,
				firstClassPrice: flight.firstClassPrice,
			},
			plane: {
				id: flight.plane._id,
				code: flight.plane.code,
				model: flight.plane.model,
				totalRows: flight.plane.totalRows,
				maxSeatsPerRow: flight.plane.maxSeatsPerRow,
				cabinConfiguration: flight.plane.cabinConfiguration,
			},
			seats: seatsByRows,
			stats: {
				...stats,
				reserved: reservations.length,
				available: stats.total - reservations.length,
			},
		});
	} catch (error) {
		console.error("Error retrieving seats:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

/**
 * @openapi
 * tags: [Seats]
 * summary: Reserve a seat for current user
 * security: [{ cookieAuth: [] }]
 */
const reserveSeat = async (req, res) => {
	try {
		const { flightId } = req.params;
		const { seatRow, seatNumber, specialRequests } = req.body;
		const userId = req.user.id;

		const flight = await Flight.findById(flightId).populate("plane");

		if (!flight) {
			return res.status(404).json({ message: "Flight not found" });
		}

		const seat = flight.plane.seatsConfiguration.find(
			(s) => s.row === seatRow && s.number === seatNumber
		);

		if (!seat) {
			return res.status(400).json({ message: "Invalid seat" });
		}

		const isAvailable = await SeatReservation.isSeatAvailable(
			flightId,
			seatRow,
			seatNumber
		);

		if (!isAvailable) {
			return res.status(400).json({ message: "Seat already occupied" });
		}

		const basePrice =
			seat.seatClass === "first" ? flight.firstClassPrice : flight.price;
		const price = Math.round(basePrice * 0.1 * 100) / 100;

		const reservation = new SeatReservation({
			flight: flightId,
			user: userId,
			plane: flight.plane._id,
			seatRow,
			seatNumber,
			seatClass: seat.seatClass,
			price,
			specialRequests,
		});

		await reservation.save();

		await reservation.populate("user", "name email");

		res.status(201).json({
			message: "Seat reserved successfully",
			reservation: {
				id: reservation._id,
				seatRow: reservation.seatRow,
				seatNumber: reservation.seatNumber,
				seatClass: reservation.seatClass,
				price: reservation.price,
				status: reservation.status,
				expiresAt: reservation.expiresAt,
				user: reservation.user,
			},
		});
	} catch (error) {
		console.error("Error reserving seat:", error);

		if (error.code === 11000) {
			return res.status(400).json({ message: "Seat already reserved" });
		}

		res.status(500).json({ message: "Internal server error" });
	}
};

/**
 * @openapi
 * tags: [Seats]
 * summary: Confirm a seat reservation
 * security: [{ cookieAuth: [] }]
 */
const confirmReservation = async (req, res) => {
	try {
		const { reservationId } = req.params;
		const userId = req.user.id;

		const reservation = await SeatReservation.findById(reservationId);

		if (!reservation) {
			return res.status(404).json({ message: "Reservation not found" });
		}

		if (reservation.user.toString() !== userId) {
			return res.status(403).json({ message: "Not authorized" });
		}

		if (reservation.isExpired()) {
			return res.status(400).json({ message: "Reservation expired" });
		}

		await reservation.confirm();

		res.json({
			message: "Reservation confirmed",
			reservation: {
				id: reservation._id,
				seatRow: reservation.seatRow,
				seatNumber: reservation.seatNumber,
				status: reservation.status,
			},
		});
	} catch (error) {
		console.error("Error confirming reservation:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

/**
 * @openapi
 * tags: [Seats]
 * summary: Cancel a reservation
 * security: [{ cookieAuth: [] }]
 */
const cancelReservation = async (req, res) => {
	try {
		const { reservationId } = req.params;
		const userId = req.user.id;

		const reservation = await SeatReservation.findById(reservationId);

		if (!reservation) {
			return res.status(404).json({ message: "Reservation not found" });
		}

		if (reservation.user.toString() !== userId) {
			return res.status(403).json({ message: "Not authorized" });
		}

		await reservation.cancel();

		res.json({
			message: "Reservation cancelled",
			reservation: {
				id: reservation._id,
				seatRow: reservation.seatRow,
				seatNumber: reservation.seatNumber,
				status: reservation.status,
			},
		});
	} catch (error) {
		console.error("Error cancelling reservation:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

/**
 * @openapi
 * tags: [Seats]
 * summary: Extend reservation hold time
 * security: [{ cookieAuth: [] }]
 */
const extendReservation = async (req, res) => {
	try {
		const { reservationId } = req.params;
		const { minutes = 15 } = req.body;
		const userId = req.user.id;

		const reservation = await SeatReservation.findById(reservationId);

		if (!reservation) {
			return res.status(404).json({ message: "Reservation not found" });
		}

		if (reservation.user.toString() !== userId) {
			return res.status(403).json({ message: "Not authorized" });
		}

		await reservation.extendReservation(minutes);

		res.json({
			message: "Reservation extended",
			reservation: {
				id: reservation._id,
				expiresAt: reservation.expiresAt,
			},
		});
	} catch (error) {
		console.error("Error extending reservation:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

/**
 * @openapi
 * tags: [Seats]
 * summary: Get current user's reservations
 * security: [{ cookieAuth: [] }]
 */
const getUserReservations = async (req, res) => {
	try {
		const userId = req.user.id;

		const reservations = await SeatReservation.find({
			user: userId,
			status: { $in: ["reserved", "confirmed"] },
		})
			.populate("flight", "flightNumber departureDate arrivalDate")
			.populate("plane", "code model")
			.sort({ createdAt: -1 });

		res.json({
			reservations: reservations.map((reservation) => ({
				id: reservation._id,
				flight: reservation.flight,
				plane: reservation.plane,
				seatRow: reservation.seatRow,
				seatNumber: reservation.seatNumber,
				seatClass: reservation.seatClass,
				status: reservation.status,
				price: reservation.price,
				expiresAt: reservation.expiresAt,
				isExpired: reservation.isExpired(),
			})),
		});
	} catch (error) {
		console.error("Error retrieving reservations:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

/**
 * @openapi
 * tags: [Seats]
 * summary: Remove expired reservations (admin)
 * security: [{ cookieAuth: [] }]
 */
const cleanExpiredReservations = async (req, res) => {
	try {
		const deletedCount = await SeatReservation.cleanExpiredReservations();

		res.json({
			message: `${deletedCount} expired reservations removed`,
			deletedCount,
		});
	} catch (error) {
		console.error("Error cleaning up reservations:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

module.exports = {
	getFlightSeats,
	reserveSeat,
	confirmReservation,
	cancelReservation,
	extendReservation,
	getUserReservations,
	cleanExpiredReservations,
};
