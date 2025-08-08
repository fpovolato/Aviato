const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seatController");
const { protect, adminOnly } = require("../middleware/auth");

// Ottieni la configurazione dei posti per un volo
/**
 * @openapi
 * /api/seats/flights/{flightId}/seats:
 *   get:
 *     tags: [Seats]
 *     summary: Get seat map and pricing for a flight
 */
router.get("/flights/:flightId/seats", seatController.getFlightSeats);

// Prenota un posto (richiede autenticazione)
/**
 * @openapi
 * /api/seats/flights/{flightId}/seats/reserve:
 *   post:
 *     tags: [Seats]
 *     summary: Reserve a seat for current user
 *     security: [{ cookieAuth: [] }]
 */
router.post(
	"/flights/:flightId/seats/reserve",
	protect,
	seatController.reserveSeat
);

// Conferma una prenotazione (richiede autenticazione)
/**
 * @openapi
 * /api/seats/reservations/{reservationId}/confirm:
 *   put:
 *     tags: [Seats]
 *     summary: Confirm a reservation
 *     security: [{ cookieAuth: [] }]
 */
router.put(
	"/reservations/:reservationId/confirm",
	protect,
	seatController.confirmReservation
);

// Cancella una prenotazione (richiede autenticazione)
/**
 * @openapi
 * /api/seats/reservations/{reservationId}:
 *   delete:
 *     tags: [Seats]
 *     summary: Cancel a reservation
 *     security: [{ cookieAuth: [] }]
 */
router.delete(
	"/reservations/:reservationId",
	protect,
	seatController.cancelReservation
);

// Estendi una prenotazione (richiede autenticazione)
/**
 * @openapi
 * /api/seats/reservations/{reservationId}/extend:
 *   put:
 *     tags: [Seats]
 *     summary: Extend reservation time window
 *     security: [{ cookieAuth: [] }]
 */
router.put(
	"/reservations/:reservationId/extend",
	protect,
	seatController.extendReservation
);

// Ottieni le prenotazioni di un utente (richiede autenticazione)
/**
 * @openapi
 * /api/seats/user/reservations:
 *   get:
 *     tags: [Seats]
 *     summary: Get current user's reservations
 *     security: [{ cookieAuth: [] }]
 */
router.get("/user/reservations", protect, seatController.getUserReservations);

// Pulisci le prenotazioni scadute (endpoint admin)
/**
 * @openapi
 * /api/seats/admin/clean-expired:
 *   delete:
 *     tags: [Seats]
 *     summary: Remove expired reservations
 *     security: [{ cookieAuth: [] }]
 */
router.delete(
	"/admin/clean-expired",
	protect,
	adminOnly,
	seatController.cleanExpiredReservations
);

module.exports = router;
