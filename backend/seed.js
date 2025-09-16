/**
 * Aviato – seed.js (full rewrite)
 * ------------------------------------------------------------
 * Usage:
 *   node seed.js
 *
 * Env:
 *   MONGO_URI=mongodb://mongo:27017/backenddb
 *   SEED_RESET=true      // se true (default) cancella i dati prima di popolare
 *   AIRPORTS_LIMIT=50    // massimo aeroporti da importare dal CSV
 *
 * Requisiti:
 *   Modelli presenti in ./models/: User, Airline, Airport, Plane, Route, Flight, Order
 *   Connessione in ./config/db che espone una funzione async connectDB()
 *   CSV opzionale: ./Dump/airports.csv (schema OpenFlights-like)
 */

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");

// Modelli
const User = require("./models/User");
const Airline = require("./models/Airline");
const Airport = require("./models/Airport");
const Plane = require("./models/Plane");
const Route = require("./models/Route");
const Flight = require("./models/Flight");
const Order = require("./models/Order");

// ----------------------------
// Config numeriche / costanti
// ----------------------------
const CFG = {
	AIRPORTS_LIMIT: parseInt(process.env.AIRPORTS_LIMIT || "50", 10),
	AIRLINES_N: 5,
	EMPLOYEES_PER_AIRLINE: 2,
	CUSTOMERS_N: 50,
	PLANES_N: 16,
	ROUTES_N: 24,
	FUTURE_FLIGHTS_N: 120,
	HISTORICAL_FLIGHTS_N: 240,
	HISTORICAL_ORDER_RATE: 0.7, // % di voli storici che avranno almeno un ordine
	MAX_PAX_PER_ORDER: 4,
};

// ----------------------------
// Utilità
// ----------------------------
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sampleWeighted = (pairs) => {
	// pairs = [[value, weight], ...]
	const total = pairs.reduce((s, [, w]) => s + w, 0);
	let r = Math.random() * total;
	for (const [v, w] of pairs) {
		if ((r -= w) <= 0) return v;
	}
	return pairs.at(-1)[0];
};
const randomDateBetween = (start, end) =>
	new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const days = (n) => n * 24 * 60 * 60 * 1000;
const hours = (n) => n * 60 * 60 * 1000;

const now = new Date();
const PAST_START = new Date(now.getTime() - days(180)); // 6 mesi fa
const PAST_END = new Date(now.getTime() - days(30)); // 1 mese fa
const FUTURE_END = new Date(now.getTime() + days(120)); // 4 mesi avanti

// ----------------------------
// Mock data
// ----------------------------
const FIRST_NAMES = [
	"Mario",
	"Luigi",
	"Francesco",
	"Giuseppe",
	"Antonio",
	"Luca",
	"Marco",
	"Andrea",
	"Alessandro",
	"Lorenzo",
	"Giulia",
	"Francesca",
	"Chiara",
	"Sara",
	"Anna",
	"Elena",
	"Valentina",
	"Martina",
	"Alessia",
	"Giorgia",
];
const LAST_NAMES = [
	"Rossi",
	"Bianchi",
	"Ferrari",
	"Russo",
	"Romano",
	"Gallo",
	"Costa",
	"Fontana",
	"Conti",
	"Greco",
	"Moretti",
	"Bruno",
	"Galli",
	"De Luca",
	"Mancini",
	"Ricci",
	"Lombardi",
	"Barbieri",
	"Colombo",
	"Benedetti",
];

const AIRLINES_POOL = [
	{ name: "Aviato Airlines", code: "AV" },
	{ name: "ItalWings", code: "IW" },
	{ name: "SkyItalia", code: "SI" },
	{ name: "Mediterranean Air", code: "MA" },
	{ name: "Alpine Airways", code: "AA" },
	{ name: "NordAir", code: "NA" },
	{ name: "EuroJet", code: "EJ" },
];

const PLANE_TYPES = [
	{
		manufacturer: "Airbus",
		model: "A320",
		seats: 180,
		layout: "3-3",
		ecoRows: [6, 30],
		firstRows: [1, 5],
		ecoPerRow: 6,
		firstPerRow: 4,
	},
	{
		manufacturer: "Boeing",
		model: "737-800",
		seats: 186,
		layout: "3-3",
		ecoRows: [6, 31],
		firstRows: [1, 5],
		ecoPerRow: 6,
		firstPerRow: 4,
	},
	{
		manufacturer: "Airbus",
		model: "A321neo",
		seats: 220,
		layout: "3-3",
		ecoRows: [6, 36],
		firstRows: [1, 5],
		ecoPerRow: 6,
		firstPerRow: 4,
	},
	{
		manufacturer: "Boeing",
		model: "787-8",
		seats: 242,
		layout: "3-3-3",
		ecoRows: [11, 40],
		firstRows: [1, 10],
		ecoPerRow: 9,
		firstPerRow: 4,
	},
	{
		manufacturer: "Airbus",
		model: "A330-200",
		seats: 247,
		layout: "2-4-2",
		ecoRows: [11, 38],
		firstRows: [1, 10],
		ecoPerRow: 8,
		firstPerRow: 4,
	},
	{
		manufacturer: "Embraer",
		model: "E190",
		seats: 100,
		layout: "2-2",
		ecoRows: [8, 25],
		firstRows: [1, 7],
		ecoPerRow: 4,
		firstPerRow: 4,
	},
	{
		manufacturer: "Airbus",
		model: "A220-300",
		seats: 145,
		layout: "2-3",
		ecoRows: [6, 30],
		firstRows: [1, 5],
		ecoPerRow: 5,
		firstPerRow: 4,
	},
];

// Prezzi medi per rotta europea short/medium haul
const BASE_PRICE_RANGE = [60, 280]; // economy
const FIRST_MULTIPLIER_RANGE = [2.0, 3.5];

// ----------------------------
// Funzioni di seeding
// ----------------------------
async function resetIfNeeded() {
	const reset = (process.env.SEED_RESET ?? "true").toLowerCase() !== "false";
	if (!reset) {
		console.log("SEED_RESET=false → non verranno cancellati i dati esistenti.");
		return;
	}
	console.log("Pulizia collezioni...");
	await Promise.all([
		User.deleteMany({}),
		Airline.deleteMany({}),
		Airport.deleteMany({}),
		Plane.deleteMany({}),
		Route.deleteMany({}),
		Flight.deleteMany({}),
		Order.deleteMany({}),
	]);
}

async function seedAdmin() {
	console.log("Creazione admin...");
	const admin = await User.create({
		name: "Admin",
		surname: "System",
		email: "admin@aviato.com",
		password: "password",
		roles: ["admin"],
		birthDate: new Date("1982-01-01"),
	});
	console.log(`  ✔ Admin: ${admin.email}`);
	return admin;
}

async function seedAirlinesAndManagers() {
	console.log("Creazione airlines + manager...");
	const airlines = [];
	const managers = [];
	const list = AIRLINES_POOL.slice(0, CFG.AIRLINES_N);

	for (let i = 0; i < list.length; i++) {
		const a = await Airline.create({ name: list[i].name, code: list[i].code });
		const manager = await User.create({
			name: pick(FIRST_NAMES),
			surname: pick(LAST_NAMES),
			email: `manager${i + 1}@${a.code.toLowerCase()}.com`,
			password: "password",
			roles: ["manager"],
			birthDate: randomDateBetween(
				new Date("1970-01-01"),
				new Date("1990-12-31")
			),
			airlines: [a._id],
		});
		a.manager = manager._id;
		await a.save();
		airlines.push(a);
		managers.push(manager);
		console.log(`  ✔ ${a.name} (${a.code}) → ${manager.email}`);
	}
	return { airlines, managers };
}

async function seedEmployees(airlines) {
	console.log("Creazione employees...");
	const employees = [];
	for (const a of airlines) {
		for (let i = 0; i < CFG.EMPLOYEES_PER_AIRLINE; i++) {
			const e = await User.create({
				name: pick(FIRST_NAMES),
				surname: pick(LAST_NAMES),
				email: `employee${employees.length + 1}@${a.code.toLowerCase()}.com`,
				password: "password",
				roles: ["employee"],
				birthDate: randomDateBetween(
					new Date("1980-01-01"),
					new Date("2004-12-31")
				),
				airlines: [a._id],
			});
			employees.push(e);
			console.log(`  ✔ ${e.email} @ ${a.code}`);
		}
	}
	return employees;
}

async function seedCustomers() {
	console.log("Creazione customers...");
	const customers = [];
	for (let i = 0; i < CFG.CUSTOMERS_N; i++) {
		const c = await User.create({
			name: pick(FIRST_NAMES),
			surname: pick(LAST_NAMES),
			email: `customer${i + 1}@gmail.com`,
			password: "password",
			roles: ["customer"],
			birthDate: randomDateBetween(
				new Date("1960-01-01"),
				new Date("2006-12-31")
			),
		});
		customers.push(c);
		if ((i + 1) % 10 === 0)
			console.log(`  ✔ customers: ${i + 1}/${CFG.CUSTOMERS_N}`);
	}
	return customers;
}

const importAirportsCSV = async () => {
	console.log("Import airports from CSV...");

	const csvPath = path.resolve("./Dump/airports.csv");
	if (!fs.existsSync(csvPath)) {
		console.log("  ⚠ CSV not found, skipping import");
		return 0;
	}

	const results = [];
	let totalRead = 0;
	const seenIds = new Set();

	return new Promise((resolve) => {
		fs.createReadStream(csvPath)
			.pipe(csv({
				headers: [
					"airportId", "name", "city", "country", "iata", "icao",
					"latitude", "longitude", "altitude", "timezone", "dst",
					"tzDatabaseTimezone", "type", "source"
				],
				skipLines: 0,
			}))
			.on("data", (row) => {
				totalRead++;
				if (totalRead % 1000 === 0) {
					console.log(`  Processing... ${totalRead} rows`);
				}

				// Parse and validate data
				const airportId = Number(row.airportId);
				if (!airportId || seenIds.has(airportId)) return;
				seenIds.add(airportId);

				const airport = {
					airportId,
					name: row.name?.trim(),
					city: row.city?.trim(),
					country: row.country?.trim(),
					iata: row.iata?.trim().toUpperCase() || null,
					icao: row.icao?.trim().toUpperCase() || null,
					latitude: parseFloat(row.latitude),
					longitude: parseFloat(row.longitude),
					altitude: Number(row.altitude),
					timezone: parseFloat(row.timezone),
					dst: row.dst?.trim() || "U",
					tzDatabaseTimezone: row.tzDatabaseTimezone?.trim(),
					type: row.type?.trim() || "airport",
					source: row.source?.trim() || "OurAirports"
				};

				// Validate required fields
				if (airport.name && airport.city && airport.country &&
					!isNaN(airport.latitude) && !isNaN(airport.longitude) &&
					!isNaN(airport.altitude) && !isNaN(airport.timezone) &&
					airport.tzDatabaseTimezone) {
					results.push(airport);
				}
			})
			.on("end", async () => {
				try {
					console.log(`  Inserting ${results.length} valid airports...`);
					const inserted = await Airport.insertMany(results, { ordered: false });
					console.log(`  ✔ Successfully imported ${inserted.length} airports`);
					resolve(inserted.length);
				} catch (error) {
					// Handle duplicates gracefully
					const successCount = error.insertedDocs ? error.insertedDocs.length : 0;
					console.log(`  ✔ Imported ${successCount} airports (some duplicates skipped)`);
					resolve(successCount);
				}
			})
			.on("error", (err) => {
				console.error("  ❌ CSV error:", err.message);
				resolve(0);
			});
	});
};

async function seedPlanes(airlines) {
	console.log("Creazione planes...");
	const planes = [];
	for (let i = 0; i < CFG.PLANES_N; i++) {
		const a = pick(airlines);
		const t = pick(PLANE_TYPES);
		const code = `${a.code}${String(i + 1).padStart(3, "0")}`;
		const plane = await Plane.create({
			code,
			manifacturer: t.manufacturer,
			model: t.model,
			airline: a._id,
			seats: t.seats,
			totalRows: Math.max(t.firstRows[1], t.ecoRows[1]),
			maxSeatsPerRow: Math.max(t.firstPerRow, t.ecoPerRow),
			cabinConfiguration: [
				{
					name: "First Class",
					seatClass: "first",
					startRow: String(t.firstRows[0]),
					endRow: String(t.firstRows[1]),
					seatsPerRow: t.firstPerRow,
					seatLayout: t.layout.includes("3-3-3") ? "1-2-1" : "2-2", // stilizzato
					priceMultiplier: sampleWeighted([
						[2.2, 2],
						[2.5, 5],
						[3.2, 3],
					]),
				},
				{
					name: "Economy Class",
					seatClass: "economy",
					startRow: String(t.ecoRows[0]),
					endRow: String(t.ecoRows[1]),
					seatsPerRow: t.ecoPerRow,
					seatLayout: t.layout,
					priceMultiplier: 1.0,
				},
			],
			hasWiFi: Math.random() > 0.5,
			hasEntertainment: Math.random() > 0.3,
			hasPowerOutlets: Math.random() > 0.4,
		});
		planes.push(plane);
	}
	console.log(`  ✔ Planes: ${planes.length}`);
	return planes;
}

function makeRouteCode(dep, arr, idx) {
	const a = (dep.iata || dep.icao || "XXX")
		.replace(/[^A-Z0-9]/gi, "")
		.slice(0, 3)
		.toUpperCase()
		.padEnd(3, "X");
	const b = (arr.iata || arr.icao || "YYY")
		.replace(/[^A-Z0-9]/gi, "")
		.slice(0, 3)
		.toUpperCase()
		.padEnd(3, "Y");
	return `${a}${b}${String(idx + 1).padStart(2, "0")}`;
}

async function seedRoutes(airports) {
	console.log("Creazione routes...");
	if (airports.length < 4) {
		console.log(
			"  ⚠ Pochi aeroporti, ne creo di base (hardcoded) per sicurezza."
		);
		const basics = await Airport.insertMany([
			{ name: "Leonardo da Vinci", city: "Rome", country: "IT", iata: "FCO" },
			{ name: "Linate", city: "Milan", country: "IT", iata: "LIN" },
			{ name: "Charles de Gaulle", city: "Paris", country: "FR", iata: "CDG" },
			{ name: "Heathrow", city: "London", country: "UK", iata: "LHR" },
		]);
		airports = basics;
	}

	const routes = [];
	const MAX_TRIES = CFG.ROUTES_N * 4;
	let tries = 0;

	while (routes.length < CFG.ROUTES_N && tries < MAX_TRIES) {
		tries++;
		const dep = pick(airports);
		const arr = pick(airports);
		if (dep._id.toString() === arr._id.toString()) continue;

		const code = makeRouteCode(dep, arr, routes.length);
		try {
			const r = await Route.create({
				departureAirport: dep._id,
				arrivalAirport: arr._id,
				code,
			});
			routes.push(r);
		} catch (e) {
			// evita duplicati
		}
	}

	console.log(`  ✔ Routes: ${routes.length}`);
	return routes;
}

function makeFlightNumber(airline, route, index, suffix = "") {
	// es. AV-FCOCDG-0123 o AVHcdg-0001 per storico
	const dep = route.code.slice(0, 3);
	const arr = route.code.slice(3, 6);
	const base = `${airline.code}${suffix}${dep}${arr}${String(
		index + 1
	).padStart(4, "0")}`;
	return base.toUpperCase();
}

function priceForFlight() {
	const base = rand(BASE_PRICE_RANGE[0], BASE_PRICE_RANGE[1]); // economy
	const firstMult = rand(FIRST_MULTIPLIER_RANGE[0], FIRST_MULTIPLIER_RANGE[1]);
	return {
		econ: Math.round(base),
		first: Math.round(base * firstMult),
		extraBag: Math.round(rand(20, 45)),
	};
}

async function seedFutureFlights(routes, planes, airlines) {
	console.log("Creazione voli FUTURI...");
	if (!routes.length || !planes.length) return [];

	const flights = [];
	for (let i = 0; i < CFG.FUTURE_FLIGHTS_N; i++) {
		const route = pick(routes);
		const plane = pick(planes);
		const airline = pick(airlines);

		const dep = randomDateBetween(now, FUTURE_END);
		const durHours = rand(1.0, 7.5);
		const arr = new Date(dep.getTime() + hours(durHours));
		const { econ, first, extraBag } = priceForFlight();

		const loadFactor = sampleWeighted([
			[0.65, 2],
			[0.75, 5],
			[0.85, 2],
			[0.92, 1],
		]);
		const seatsAvailable = Math.max(
			0,
			Math.round(plane.seats * (1 - loadFactor))
		);

		const data = {
			flightNumber: makeFlightNumber(airline, route, i),
			route: route._id,
			departureDate: dep,
			arrivalDate: arr,
			airline: airline._id,
			plane: plane._id,
			status: sampleWeighted([
				["scheduled", 8],
				["delayed", 1],
			]),
			price: econ,
			firstClassPrice: first,
			additionalLuggagePrice: extraBag,
			seatsAvailable,
		};

		try {
			const f = await Flight.create(data);
			flights.push(f);
			if ((i + 1) % 20 === 0)
				console.log(`  ✔ Future flights: ${i + 1}/${CFG.FUTURE_FLIGHTS_N}`);
		} catch (e) {
			console.log(
				`  ⚠ Future flight skipped (${data.flightNumber}): ${e.message}`
			);
		}
	}
	return flights;
}

async function seedHistoricalFlights(routes, planes, airlines) {
	console.log("Creazione voli STORICI (landed)...");
	if (!routes.length || !planes.length) return [];

	const flights = [];
	for (let i = 0; i < CFG.HISTORICAL_FLIGHTS_N; i++) {
		const route = pick(routes);
		const plane = pick(planes);
		const airline = pick(airlines);

		const dep = randomDateBetween(PAST_START, PAST_END);
		const durHours = rand(1.0, 8.0);
		const arr = new Date(dep.getTime() + hours(durHours));
		const { econ, first, extraBag } = priceForFlight();

		const loadFactor = sampleWeighted([
			[0.7, 2],
			[0.8, 5],
			[0.9, 3],
			[0.95, 1],
		]);
		const seatsAvailable = Math.max(
			0,
			Math.round(plane.seats * (1 - loadFactor))
		);

		const data = {
			flightNumber: makeFlightNumber(airline, route, i, "H"),
			route: route._id,
			departureDate: dep,
			arrivalDate: arr,
			airline: airline._id,
			plane: plane._id,
			status: "landed",
			price: econ,
			firstClassPrice: first,
			additionalLuggagePrice: extraBag,
			seatsAvailable,
		};

		try {
			const f = await Flight.create(data);
			flights.push(f);
			if ((i + 1) % 40 === 0)
				console.log(
					`  ✔ Historical flights: ${i + 1}/${CFG.HISTORICAL_FLIGHTS_N}`
				);
		} catch (e) {
			console.log(
				`  ⚠ Historical flight skipped (${data.flightNumber}): ${e.message}`
			);
		}
	}
	return flights;
}

async function seedHistoricalOrders(customers, historicalFlights) {
	console.log("Creazione ORDINI storici...");
	if (!customers.length || !historicalFlights.length) {
		console.log("  ⚠ Non ci sono customers o voli storici → salto");
		return [];
	}

	// Seleziona ~70% dei voli storici per avere ordini
	const flightsPool = [...historicalFlights];
	const toPick = Math.floor(flightsPool.length * CFG.HISTORICAL_ORDER_RATE);
	const targetFlights = [];
	while (targetFlights.length < toPick && flightsPool.length) {
		const idx = randInt(0, flightsPool.length - 1);
		targetFlights.push(flightsPool.splice(idx, 1)[0]);
	}

	const orders = [];
	const paymentMethods = ["Credit Card", "PayPal", "Bank Transfer"];

	console.log(`  Processing ${targetFlights.length} flights for historical orders...`);
	for (let i = 0; i < targetFlights.length; i++) {
		const flight = targetFlights[i];
		const buyer = pick(customers);

		// Quanti passeggeri (bias verso 1–2)
		const pax = sampleWeighted([
			[1, 7],
			[2, 4],
			[3, 2],
			[4, 1],
		]);
		const seatClass = sampleWeighted([
			["economy", 8],
			["first", 2],
		]);
		const pricePerSeat =
			seatClass === "economy" ? flight.price : flight.firstClassPrice;

		// Bagagli extra: 0–2 (30% di probabilità >0)
		const extraBags = Math.random() < 0.3 ? randInt(1, 2) : 0;
		const extraBagsPrice = extraBags * flight.additionalLuggagePrice;

		// Data d’acquisto: 60–1 giorno prima della partenza
		const createdAt = new Date(flight.departureDate.getTime() - days(60));
		const purchaseDate = randomDateBetween(
			createdAt,
			new Date(flight.departureDate.getTime() - days(1))
		);

		// Selezione posti plausibile rispetto al layout
		const plane = await Plane.findById(flight.plane);
		const t =
			PLANE_TYPES.find(
				(x) => x.model === plane.model && x.manufacturer === plane.manifacturer
			) || PLANE_TYPES[0];

		const seatPick = [];
		for (let p = 1; p <= pax; p++) {
			const row =
				seatClass === "first"
					? randInt(t.firstRows[0], t.firstRows[1])
					: randInt(t.ecoRows[0], t.ecoRows[1]);
			const perRow = seatClass === "first" ? t.firstPerRow : t.ecoPerRow;
			const seatNum = randInt(1, perRow);
			seatPick.push({
				passengerNumber: p,
				seatRow: String(row),
				seatNumber: seatNum,
				seatClass,
				price: pricePerSeat,
			});
		}

		const total = pricePerSeat * pax + extraBagsPrice;

		// Info rotta/compagnia da salvare nell’ordine
		const airline = await Airline.findById(flight.airline);
		const fullRoute = await Route.findById(flight.route).populate(
			"departureAirport arrivalAirport"
		);

		const order = {
			user: buyer._id,
			items: [
				{
					flight: flight._id,
					flightInfo: {
						flightNumber: flight.flightNumber,
						from: fullRoute.departureAirport.name,
						to: fullRoute.arrivalAirport.name,
						departureDate: flight.departureDate.toISOString(),
						arrivalDate: flight.arrivalDate.toISOString(),
						airline: { name: airline.name, code: airline.code },
						price: flight.price,
						firstClassPrice: flight.firstClassPrice,
						additionalLuggagePrice: flight.additionalLuggagePrice,
					},
					quantity: 1,
					priceAtPurchase: pricePerSeat,
					additionalLuggage: extraBags,
					additionalLuggagePrice: extraBagsPrice,
					seatClass,
					passengers: pax,
					selectedSeats: seatPick,
				},
			],
			total,
			status: "Completed",
			paymentMethod: pick(paymentMethods),
			paymentDetails: {
				transactionId: `TXN_${Date.now()}_${i}`,
				last4: String(randInt(1000, 9999)),
			},
			purchasedAt: purchaseDate,
		};

		try {
			const saved = await Order.create(order);
			orders.push(saved);
			if ((i + 1) % 10 === 0 || i === 0)
				console.log(`  ✔ Orders: ${i + 1}/${targetFlights.length}`);
		} catch (e) {
			console.log(`  ⚠ Order error (${flight.flightNumber}): ${e.message}`);
		}
	}

	console.log(`  ✔ Ordini creati: ${orders.length}`);
	return orders;
}

// ----------------------------
// MAIN
// ----------------------------
(async function main() {
	try {
		console.log("🌱 Avvio seeding...\n");
		await connectDB();

		await resetIfNeeded();

		const admin = await seedAdmin();
		const { airlines, managers } = await seedAirlinesAndManagers();
		const employees = await seedEmployees(airlines);
		const customers = await seedCustomers();

		const airportCount = await importAirportsCSV();
		console.log("Fetching airports from database...");
		let airports = await Airport.find({}).limit(CFG.AIRPORTS_LIMIT);
		console.log(`✔ Found ${airports.length} airports in database`);
		if (!airports.length) {
			// fallback minimo (se CSV assente)
			airports = await Airport.insertMany([
				{ name: "Leonardo da Vinci", city: "Rome", country: "IT", iata: "FCO" },
				{ name: "Linate", city: "Milan", country: "IT", iata: "LIN" },
				{
					name: "Charles de Gaulle",
					city: "Paris",
					country: "FR",
					iata: "CDG",
				},
				{ name: "Heathrow", city: "London", country: "UK", iata: "LHR" },
				{ name: "Barajas", city: "Madrid", country: "ES", iata: "MAD" },
				{ name: "Schiphol", city: "Amsterdam", country: "NL", iata: "AMS" },
			]);
			console.log(`  ✔ Airports fallback: ${airports.length}`);
		}

		const planes = await seedPlanes(airlines);
		const routes = await seedRoutes(airports);

		const futureFlights = await seedFutureFlights(routes, planes, airlines);
		const historicalFlights = await seedHistoricalFlights(
			routes,
			planes,
			airlines
		);
		const historicalOrders = await seedHistoricalOrders(
			customers,
			historicalFlights
		);

		console.log("\n✅ Seeding completato!\n");
		console.log("📊 Riepilogo:");
		console.log(`- Admin: 1`);
		console.log(`- Airlines: ${airlines.length}`);
		console.log(`- Managers: ${managers.length}`);
		console.log(`- Employees: ${employees.length}`);
		console.log(`- Customers: ${customers.length}`);
		console.log(`- Airports: ${airportCount} imported, ${airports.length} available`);
		console.log(`- Planes: ${planes.length}`);
		console.log(`- Routes: ${routes.length}`);
		console.log(`- Future flights: ${futureFlights.length}`);
		console.log(`- Historical flights: ${historicalFlights.length}`);
		console.log(`- Historical orders: ${historicalOrders.length}`);

		console.log("\n🔑 Credenziali:");
		console.log("  Admin: admin@aviato.com / password");
		console.log("  Manager: manager1@av.com / password (ecc.)");
		console.log("  Employee: employee1@av.com / password (ecc.)");
		console.log("  Customer: customer1@gmail.com / password (ecc.)");

		process.exit(0);
	} catch (err) {
		console.error("❌ Seed error:", err);
		process.exit(1);
	}
})();
