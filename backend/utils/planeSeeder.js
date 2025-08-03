const mongoose = require("mongoose");
const Plane = require("../models/Plane");
const Airline = require("../models/Airline");
require("dotenv").config();

// Configurazione di esempio per diversi tipi di aerei
const planeConfigurations = [
	{
		code: "A320-001",
		manifacturer: "Airbus",
		model: "A320",
		seats: 180,
		totalRows: 30,
		maxSeatsPerRow: 6,
		hasWiFi: true,
		hasEntertainment: true,
		hasPowerOutlets: true,
		cabinConfiguration: [
			{
				name: "First Class",
				seatClass: "first",
				startRow: "1",
				endRow: "3",
				seatsPerRow: 4,
				seatLayout: "2-2",
				priceMultiplier: 2.5,
			},
			{
				name: "Economy Class",
				seatClass: "economy",
				startRow: "4",
				endRow: "30",
				seatsPerRow: 6,
				seatLayout: "3-3",
				priceMultiplier: 1.0,
			},
		],
	},
	{
		code: "B737-001",
		manifacturer: "Boeing",
		model: "737-800",
		seats: 162,
		totalRows: 27,
		maxSeatsPerRow: 6,
		hasWiFi: true,
		hasEntertainment: false,
		hasPowerOutlets: true,
		cabinConfiguration: [
			{
				name: "First Class",
				seatClass: "first",
				startRow: "1",
				endRow: "2",
				seatsPerRow: 4,
				seatLayout: "2-2",
				priceMultiplier: 2.0,
			},
			{
				name: "Economy Class",
				seatClass: "economy",
				startRow: "3",
				endRow: "27",
				seatsPerRow: 6,
				seatLayout: "3-3",
				priceMultiplier: 1.0,
			},
		],
	},
	{
		code: "A350-001",
		manifacturer: "Airbus",
		model: "A350-900",
		seats: 325,
		totalRows: 35,
		maxSeatsPerRow: 9,
		hasWiFi: true,
		hasEntertainment: true,
		hasPowerOutlets: true,
		cabinConfiguration: [
			{
				name: "First Class",
				seatClass: "first",
				startRow: "1",
				endRow: "4",
				seatsPerRow: 4,
				seatLayout: "2-2",
				priceMultiplier: 3.0,
			},
			{
				name: "Business Class",
				seatClass: "first", // Usiamo first per business anche
				startRow: "5",
				endRow: "12",
				seatsPerRow: 6,
				seatLayout: "2-2-2",
				priceMultiplier: 2.0,
			},
			{
				name: "Economy Class",
				seatClass: "economy",
				startRow: "13",
				endRow: "35",
				seatsPerRow: 9,
				seatLayout: "3-3-3",
				priceMultiplier: 1.0,
			},
		],
	},
	{
		code: "B787-001",
		manifacturer: "Boeing",
		model: "787-9 Dreamliner",
		seats: 290,
		totalRows: 32,
		maxSeatsPerRow: 9,
		hasWiFi: true,
		hasEntertainment: true,
		hasPowerOutlets: true,
		cabinConfiguration: [
			{
				name: "First Class",
				seatClass: "first",
				startRow: "1",
				endRow: "3",
				seatsPerRow: 4,
				seatLayout: "2-2",
				priceMultiplier: 2.8,
			},
			{
				name: "Premium Economy",
				seatClass: "first", // Usiamo first per premium economy
				startRow: "4",
				endRow: "8",
				seatsPerRow: 7,
				seatLayout: "2-3-2",
				priceMultiplier: 1.5,
			},
			{
				name: "Economy Class",
				seatClass: "economy",
				startRow: "9",
				endRow: "32",
				seatsPerRow: 9,
				seatLayout: "3-3-3",
				priceMultiplier: 1.0,
			},
		],
	},
];

const seedPlanes = async () => {
	try {
		// Connetti al database
		const mongoUri = process.env.MONGO_URI || "mongodb://mongo:27017/backenddb";
		await mongoose.connect(mongoUri);
		console.log("Connesso al database");

		// Ottieni la prima compagnia aerea (assumendo che esista)
		const airline = await Airline.findOne();
		if (!airline) {
			console.error(
				"Nessuna compagnia aerea trovata. Crea prima una compagnia aerea."
			);
			return;
		}

		// Pulisci i piani esistenti
		await Plane.deleteMany({});
		console.log("Piani esistenti rimossi");

		// Crea i nuovi piani
		const planes = [];
		for (const config of planeConfigurations) {
			const plane = new Plane({
				...config,
				airline: airline._id,
			});

			// Genera automaticamente la configurazione dei posti
			plane.generateSeatsConfiguration();

			planes.push(plane);
		}

		// Salva tutti i piani
		await Plane.insertMany(planes);
		console.log(`${planes.length} piani creati con successo`);

		// Mostra le statistiche per ogni piano
		for (const plane of planes) {
			const stats = plane.getSeatsStats();
			console.log(`\nPiano ${plane.code}:`);
			console.log(`- Posti totali: ${stats.total}`);
			console.log(`- Prima classe: ${stats.first}`);
			console.log(`- Classe economica: ${stats.economy}`);
			console.log(`- Posti finestrino: ${stats.window}`);
			console.log(`- Posti corridoio: ${stats.aisle}`);
		}

		console.log("\nSeeding completato!");
	} catch (error) {
		console.error("Errore durante il seeding:", error);
	} finally {
		await mongoose.disconnect();
		console.log("Disconnesso dal database");
	}
};

// Esegui il seeding se il file viene chiamato direttamente
if (require.main === module) {
	seedPlanes();
}

module.exports = { seedPlanes, planeConfigurations };
