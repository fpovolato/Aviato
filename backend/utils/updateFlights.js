const mongoose = require("mongoose");
const Flight = require("../models/Flight");
const Plane = require("../models/Plane");
require("dotenv").config();

const updateFlights = async () => {
	try {
		// Connetti al database
		const mongoUri =
			process.env.MONGO_URI || "mongodb://localhost:27017/backenddb";
		await mongoose.connect(mongoUri);
		console.log("Connesso al database");

		// Ottieni tutti i piani
		const planes = await Plane.find();
		if (planes.length === 0) {
			console.error("Nessun piano trovato");
			return;
		}

		// Ottieni tutti i voli
		const allFlights = await Flight.find();
		console.log(`Trovati ${allFlights.length} voli totali`);

		// Aggiorna tutti i voli con piani
		for (let i = 0; i < allFlights.length; i++) {
			const flight = allFlights[i];
			const plane = planes[i % planes.length];

			await Flight.findByIdAndUpdate(flight._id, {
				plane: plane._id,
				seatsAvailable: plane.seats,
			});
		}

		console.log("Tutti i voli aggiornati con successo!");

		// Verifica
		const updatedFlights = await Flight.find().populate("plane").limit(3);
		console.log("\nEsempi di voli aggiornati:");
		updatedFlights.forEach((flight) => {
			console.log(
				`- ${flight.flightNumber}: Piano ${
					flight.plane?.code || "N/A"
				}, Posti: ${flight.seatsAvailable}`
			);
		});
	} catch (error) {
		console.error("Errore durante l'aggiornamento:", error);
	} finally {
		await mongoose.disconnect();
		console.log("Disconnesso dal database");
	}
};

// Esegui se il file viene chiamato direttamente
if (require.main === module) {
	updateFlights();
}

module.exports = { updateFlights };
