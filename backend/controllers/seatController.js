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
			return res.status(404).json({ message: "Volo non trovato" });
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
					seat.price = Math.round(basePrice * 0.1 * 100) / 100; // Solo il 10%
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
		console.error("Errore nel recupero dei posti:", error);
		res.status(500).json({ message: "Errore interno del server" });
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
			return res.status(404).json({ message: "Volo non trovato" });
		}

		const seat = flight.plane.seatsConfiguration.find(
			(s) => s.row === seatRow && s.number === seatNumber
		);

		if (!seat) {
			return res.status(400).json({ message: "Posto non valido" });
		}

		const isAvailable = await SeatReservation.isSeatAvailable(
			flightId,
			seatRow,
			seatNumber
		);

		if (!isAvailable) {
			return res.status(400).json({ message: "Posto già occupato" });
		}

		const basePrice =
			seat.seatClass === "first" ? flight.firstClassPrice : flight.price;
		const price = Math.round(basePrice * 0.1 * 100) / 100; // Solo il 10%

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
			message: "Posto prenotato con successo",
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
		console.error("Errore nella prenotazione del posto:", error);

		if (error.code === 11000) {
			return res.status(400).json({ message: "Posto già prenotato" });
		}

		res.status(500).json({ message: "Errore interno del server" });
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
			return res.status(404).json({ message: "Prenotazione non trovata" });
		}

		if (reservation.user.toString() !== userId) {
			return res.status(403).json({ message: "Non autorizzato" });
		}

		if (reservation.isExpired()) {
			return res.status(400).json({ message: "Prenotazione scaduta" });
		}

		await reservation.confirm();

		res.json({
			message: "Prenotazione confermata",
			reservation: {
				id: reservation._id,
				seatRow: reservation.seatRow,
				seatNumber: reservation.seatNumber,
				status: reservation.status,
			},
		});
	} catch (error) {
		console.error("Errore nella conferma della prenotazione:", error);
		res.status(500).json({ message: "Errore interno del server" });
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
			return res.status(404).json({ message: "Prenotazione non trovata" });
		}

		if (reservation.user.toString() !== userId) {
			return res.status(403).json({ message: "Non autorizzato" });
		}

		await reservation.cancel();

		res.json({
			message: "Prenotazione cancellata",
			reservation: {
				id: reservation._id,
				seatRow: reservation.seatRow,
				seatNumber: reservation.seatNumber,
				status: reservation.status,
			},
		});
	} catch (error) {
		console.error("Errore nella cancellazione della prenotazione:", error);
		res.status(500).json({ message: "Errore interno del server" });
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
			return res.status(404).json({ message: "Prenotazione non trovata" });
		}

		if (reservation.user.toString() !== userId) {
			return res.status(403).json({ message: "Non autorizzato" });
		}

		await reservation.extendReservation(minutes);

		res.json({
			message: "Prenotazione estesa",
			reservation: {
				id: reservation._id,
				expiresAt: reservation.expiresAt,
			},
		});
	} catch (error) {
		console.error("Errore nell'estensione della prenotazione:", error);
		res.status(500).json({ message: "Errore interno del server" });
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
		console.error("Errore nel recupero delle prenotazioni:", error);
		res.status(500).json({ message: "Errore interno del server" });
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
			message: `${deletedCount} prenotazioni scadute rimosse`,
			deletedCount,
		});
	} catch (error) {
		console.error("Errore nella pulizia delle prenotazioni:", error);
		res.status(500).json({ message: "Errore interno del server" });
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
