const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seatController");
const { protect, adminOnly } = require("../middleware/auth");

// Ottieni la configurazione dei posti per un volo
router.get("/flights/:flightId/seats", seatController.getFlightSeats);

// Prenota un posto (richiede autenticazione)
router.post(
	"/flights/:flightId/seats/reserve",
	protect,
	seatController.reserveSeat
);

// Conferma una prenotazione (richiede autenticazione)
router.put(
	"/reservations/:reservationId/confirm",
	protect,
	seatController.confirmReservation
);

// Cancella una prenotazione (richiede autenticazione)
router.delete(
	"/reservations/:reservationId",
	protect,
	seatController.cancelReservation
);

// Estendi una prenotazione (richiede autenticazione)
router.put(
	"/reservations/:reservationId/extend",
	protect,
	seatController.extendReservation
);

// Ottieni le prenotazioni di un utente (richiede autenticazione)
router.get("/user/reservations", protect, seatController.getUserReservations);

// Pulisci le prenotazioni scadute (endpoint admin)
router.delete(
	"/admin/clean-expired",
	protect,
	adminOnly,
	seatController.cleanExpiredReservations
);

module.exports = router;
