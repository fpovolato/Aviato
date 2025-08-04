const mongoose = require("mongoose");
const Flight = require("../models/Flight");
const Route = require("../models/Route");
const Airline = require("../models/Airline");
const Plane = require("../models/Plane");
const Airport = require("../models/Airport");
require("dotenv").config();

const seedFlights = async () => {
	try {
		// Connetti al database
		const mongoUri =
			process.env.MONGO_URI || "mongodb://localhost:27017/backenddb";
		await mongoose.connect(mongoUri);
		console.log("Connesso al database");

		// Ottieni aeroporti di esempio
		const airports = await Airport.find().limit(10);
		if (airports.length < 2) {
			console.error("Non ci sono abbastanza aeroporti nel database");
			return;
		}

		// Ottieni la prima compagnia aerea
		const airline = await Airline.findOne();
		if (!airline) {
			console.error("Nessuna compagnia aerea trovata");
			return;
		}

		// Ottieni i primi piani
		const planes = await Plane.find().limit(2);
		if (planes.length === 0) {
			console.error("Nessun piano trovato. Esegui prima il planeSeeder");
			return;
		}

		// Crea rotte di esempio
		const routes = [];
		for (let i = 0; i < airports.length - 1; i++) {
			const routeCode = `${airports[i].iata}-${airports[i + 1].iata}`;

			// Controlla se la rotta esiste già
			const existingRoute = await Route.findOne({ code: routeCode });
			if (existingRoute) {
				routes.push(existingRoute);
				continue;
			}

			const route = new Route({
				departureAirport: airports[i]._id,
				arrivalAirport: airports[i + 1]._id,
				code: routeCode,
			});
			routes.push(route);
		}

		// Salva solo le nuove rotte
		const newRoutes = routes.filter((route) => !route._id);
		if (newRoutes.length > 0) {
			await Route.insertMany(newRoutes);
			console.log(`${newRoutes.length} nuove rotte create`);
		} else {
			console.log("Tutte le rotte esistono già");
		}

		// Crea voli di esempio
		const flights = [];
		const now = new Date();

		for (let i = 0; i < routes.length; i++) {
			const route = routes[i];
			const plane = planes[i % planes.length];

			// Crea voli per i prossimi 7 giorni
			for (let day = 0; day < 7; day++) {
				const departureDate = new Date(now);
				departureDate.setDate(departureDate.getDate() + day);
				departureDate.setHours(8 + ((i * 2) % 12), 0, 0, 0); // Voli distribuiti durante il giorno

				const arrivalDate = new Date(departureDate);
				// Durata stimata tra 60 e 240 minuti
				const estimatedDuration = 60 + Math.floor(Math.random() * 180);
				arrivalDate.setMinutes(arrivalDate.getMinutes() + estimatedDuration);

				const basePrice = 100 + Math.floor(Math.random() * 400); // 100-500€

				const flight = new Flight({
					flightNumber: `AV${String(i + 1).padStart(3, "0")}${String(
						day + 1
					).padStart(2, "0")}`,
					route: route._id,
					departureDate: departureDate,
					arrivalDate: arrivalDate,
					airline: airline._id,
					plane: plane._id,
					status: "scheduled",
					price: basePrice,
					firstClassPrice: basePrice * 2.5,
					additionalLuggagePrice: 30,
					seatsAvailable: plane.seats,
				});

				flights.push(flight);
			}
		}

		// Salva i voli
		await Flight.insertMany(flights);
		console.log(`${flights.length} voli creati con successo`);

		// Mostra alcuni esempi
		const sampleFlights = await Flight.find()
			.populate("route")
			.populate("plane")
			.limit(3);

		console.log("\nEsempi di voli creati:");
		sampleFlights.forEach((flight) => {
			console.log(
				`- ${flight.flightNumber}: ${flight.route.departureAirport} → ${flight.route.arrivalAirport}`
			);
			console.log(
				`  Prezzo: ${flight.price}€, Prima classe: ${flight.firstClassPrice}€`
			);
			console.log(`  Posti disponibili: ${flight.seatsAvailable}`);
		});

		console.log("\nSeeding voli completato!");
	} catch (error) {
		console.error("Errore durante il seeding dei voli:", error);
	} finally {
		await mongoose.disconnect();
		console.log("Disconnesso dal database");
	}
};

// Esegui il seeding se il file viene chiamato direttamente
if (require.main === module) {
	seedFlights();
}

module.exports = { seedFlights };
