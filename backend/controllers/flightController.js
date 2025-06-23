const mongoose = require("mongoose");
const Flight = require("../models/Flight");
const Airline = require("../models/Airline");
const Plane = require("../models/Plane");
const Route = require("../models/Route");

const createFlight = async (req, res) => {
	const {
		flightNumber,
		route,
		departureDate,
		arrivalDate,
		airline,
		plane,
		status,
		price,
		firstClassPrice,
		additionalLuggagePrice,
	} = req.body;

	try {
		if (await Flight.findOne({ flightNumber })) {
			return res.status(400).json({ message: "Flight already exists" });
		}

		const ids = [route, airline];
		if (plane) ids.push(plane);
		if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
			return res.status(400).json({ message: "Invalid reference ID format" });
		}

		const [routeObj, al, pl] = await Promise.all([
			Route.findById(route),
			Airline.findById(airline),
			plane ? Plane.findById(plane) : Promise.resolve(true),
		]);
		if (!routeObj || !al || (plane && !pl)) {
			return res.status(404).json({ message: "Referenced entity not found" });
		}

		if (new Date(arrivalDate) <= new Date(departureDate)) {
			return res
				.status(400)
				.json({ message: "arrivalDate must be after departureDate" });
		}

		// Controllo sovrapposizione voli per lo stesso aereo
		if (plane) {
			const overlappingFlight = await Flight.findOne({
				plane: plane,
				$or: [
					{
						departureDate: { $lt: arrivalDate },
						arrivalDate: { $gt: departureDate },
					},
				],
			});
			if (overlappingFlight) {
				return res.status(400).json({
					message: "Esiste già un volo sovrapposto per questo aereo.",
				});
			}
		}

		const flightData = {
			flightNumber,
			route,
			departureDate,
			arrivalDate,
			airline,
			plane,
			price,
			firstClassPrice,
			additionalLuggagePrice,
			seatsAvailable: pl ? pl.seats : 0,
		};
		if (status) flightData.status = status;

		const flight = await Flight.create(flightData);

		const fullFlight = await Flight.findById(flight._id)
			.populate({
				path: "route",
				populate: [
					{ path: "departureAirport", select: "name iata" },
					{ path: "arrivalAirport", select: "name iata" },
				],
			})
			.populate("airline", "name code")
			.populate("plane", "code manifacturer model seats");
		return res.status(201).json(fullFlight);
	} catch (error) {
		console.error("❌ Error in createFlight:", error);
		return res
			.status(500)
			.json({ message: "Server error", error: error.message });
	}
};

const getFlights = async (req, res) => {
	try {
		const flights = await Flight.find()
			.populate({
				path: "route",
				populate: [
					{
						path: "departureAirport",
						select: "name city country iata icao tzDatabaseTimezone",
					},
					{
						path: "arrivalAirport",
						select: "name city country iata icao tzDatabaseTimezone",
					},
				],
			})
			.populate({ path: "airline", select: "name code" })
			.populate({ path: "plane", select: "code manifacturer model seats" })
			.sort({ departureDate: 1 });

		const flightWithDuration = flights.map((flight) => {
			const obj = flight.toObject();
			const ms = new Date(obj.arrivalDate) - new Date(obj.departureDate);
			const totalMinutes = Math.floor(ms / 60000);
			const hours = Math.floor(totalMinutes / 60);
			const minutes = totalMinutes % 60;
			obj.duration = `${hours}h ${minutes}m`;
			return obj;
		});
		return res.status(200).json(flightWithDuration);
	} catch (error) {
		console.error("❌ Error in getFlights:", error);
		return res
			.status(500)
			.json({ message: "Server error", error: error.message });
	}
};

const getFlightById = async (req, res) => {
	try {
		const flight = await Flight.findById(req.params.id)
			.populate({
				path: "route",
				populate: [
					{
						path: "departureAirport",
						select: "name city country iata icao tzDatabaseTimezone",
					},
					{
						path: "arrivalAirport",
						select: "name city country iata icao tzDatabaseTimezone",
					},
				],
			})
			.populate({ path: "airline", select: "name code" })
			.populate({ path: "plane", select: "code manifacturer model seats" });
		if (!flight) {
			return res.status(404).json({ message: "Flight not found" });
		}
		const obj = flight.toObject();
		const ms = new Date(obj.arrivalDate) - new Date(obj.departureDate);
		const totalMinutes = Math.floor(ms / 60000);
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		obj.duration = `${hours}h ${minutes}m`;
		return res.status(200).json(obj);
	} catch (error) {
		console.error("❌ Error in getFlightById:", error);
		return res
			.status(500)
			.json({ message: "Server error", error: error.message });
	}
};

const getFlightsByAirline = async (req, res) => {
	try {
		const flights = await Flight.find({ airline: req.params.id })
			.populate({
				path: "route",
				populate: [
					{
						path: "departureAirport",
						select: "name city country iata icao tzDatabaseTimezone",
					},
					{
						path: "arrivalAirport",
						select: "name city country iata icao tzDatabaseTimezone",
					},
				],
			})
			.populate({ path: "airline", select: "name code" })
			.populate({ path: "plane", select: "code manifacturer model seats" });
		if (!flights) {
			return res.status(404).json({ message: "Flights not found" });
		}
		const flightWithDuration = flights.map((flight) => {
			const obj = flight.toObject();
			const ms = new Date(obj.arrivalDate) - new Date(obj.departureDate);
			const totalMinutes = Math.floor(ms / 60000);
			const hours = Math.floor(totalMinutes / 60);
			const minutes = totalMinutes % 60;
			obj.duration = `${hours}h ${minutes}m`;
			return obj;
		});
		return res.status(200).json(flightWithDuration);
	} catch (error) {
		console.error("❌ Error in getFlightsByAirline:", error);
		return res
			.status(500)
			.json({ message: "Server error", error: error.message });
	}
};

const updateFlight = async (req, res) => {
	const {
		flightNumber,
		route,
		departureDate,
		arrivalDate,
		airline,
		plane,
		status,
		price,
		firstClassPrice,
		additionalLuggagePrice,
	} = req.body;

	try {
		const flight = await Flight.findById(req.params.id);
		if (!flight) {
			return res.status(404).json({ message: "Flight not found" });
		}

		const ids = [route, airline];
		if (plane) ids.push(plane);
		if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
			return res.status(400).json({ message: "Invalid reference ID format" });
		}

		const [routeObj, al, pl] = await Promise.all([
			Route.findById(route),
			Airline.findById(airline),
			plane ? Plane.findById(plane) : Promise.resolve(true),
		]);
		if (!routeObj || !al || (plane && !pl)) {
			return res.status(404).json({ message: "Referenced entity not found" });
		}

		if (new Date(arrivalDate) <= new Date(departureDate)) {
			return res
				.status(400)
				.json({ message: "arrivalDate must be after departureDate" });
		}

		const flightData = {
			flightNumber,
			route,
			departureDate,
			arrivalDate,
			airline,
			plane,
			price,
			firstClassPrice,
			additionalLuggagePrice,
		};
		if (status) flightData.status = status;

		Object.assign(flight, flightData);
		await flight.save();

		const fullFlight = await Flight.findById(flight._id)
			.populate({
				path: "route",
				populate: [
					{ path: "departureAirport", select: "name iata" },
					{ path: "arrivalAirport", select: "name iata" },
				],
			})
			.populate("airline", "name code")
			.populate("plane", "code manifacturer model seats");
		return res.status(200).json(fullFlight);
	} catch (error) {
		console.error("❌ Error in updateFlight:", error);
		return res
			.status(500)
			.json({ message: "Server error", error: error.message });
	}
};

const deleteFlight = async (req, res) => {
	try {
		const flight = await Flight.findByIdAndDelete(req.params.id);
		if (!flight) {
			return res.status(404).json({ message: "Flight not found" });
		}
		return res.status(200).json({ message: "Flight deleted successfully" });
	} catch (error) {
		console.error("❌ Error in deleteFlight:", error);
		return res
			.status(500)
			.json({ message: "Server error", error: error.message });
	}
};

// Aggiorna solo lo status di un volo
const updateFlightStatus = async (req, res) => {
	try {
		const flight = await Flight.findById(req.params.id);
		if (!flight) {
			return res.status(404).json({ message: "Flight not found" });
		}
		const { status } = req.body;
		if (
			!status ||
			!["scheduled", "delayed", "cancelled", "departed", "landed"].includes(
				status
			)
		) {
			return res.status(400).json({ message: "Invalid or missing status" });
		}
		flight.status = status;
		await flight.save();
		return res.status(200).json(flight);
	} catch (error) {
		console.error("❌ Error in updateFlightStatus:", error);
		return res
			.status(500)
			.json({ message: "Server error", error: error.message });
	}
};

// @desc    Search flights (direct and one-stop)
// @route   GET /api/flights/search
// @access  Public
const searchFlights = async (req, res) => {
	try {
		const {
			from,
			to,
			departureDate,
			departureDateEnd,
			returnDate,
			returnDateEnd,
		} = req.query;
		if (!from || !to) {
			return res.status(400).json({ message: "from and to are required" });
		}
		// Trova tutte le rotte dirette
		const directRoutes = await Route.find({
			departureAirport: from,
			arrivalAirport: to,
		}).select("_id");
		const directRouteIds = directRoutes.map((r) => r._id);
		let flightQuery = { route: { $in: directRouteIds } };
		if (departureDate && departureDateEnd) {
			flightQuery["departureDate"] = {
				$gte: new Date(departureDate),
				$lt: new Date(departureDateEnd),
			};
		} else if (departureDate) {
			flightQuery["departureDate"] = { $gte: new Date(departureDate) };
		}
		if (returnDate && returnDateEnd) {
			flightQuery["arrivalDate"] = {
				$gte: new Date(returnDate),
				$lt: new Date(returnDateEnd),
			};
		} else if (returnDate) {
			flightQuery["arrivalDate"] = { $gte: new Date(returnDate) };
		}
		const directFlights = await Flight.find(flightQuery)
			.populate({
				path: "route",
				populate: [
					{
						path: "departureAirport",
						select: "name city country iata icao tzDatabaseTimezone",
					},
					{
						path: "arrivalAirport",
						select: "name city country iata icao tzDatabaseTimezone",
					},
				],
			})
			.populate({ path: "airline", select: "name code" })
			.populate({ path: "plane", select: "code manifacturer model seats" })
			.sort({ departureDate: 1 });

		// Trova tutte le rotte dal from verso aeroporti intermedi
		const firstLegRoutes = await Route.find({
			departureAirport: from,
			arrivalAirport: { $ne: to },
		});
		const oneStopResults = [];
		for (const firstLeg of firstLegRoutes) {
			// Trova tutte le rotte dal secondo aeroporto verso to
			const secondLegRoutes = await Route.find({
				departureAirport: firstLeg.arrivalAirport,
				arrivalAirport: to,
			});
			for (const secondLeg of secondLegRoutes) {
				// Trova i voli per il primo segmento
				const firstFlights = await Flight.find({
					route: firstLeg._id,
					...(departureDate && departureDateEnd
						? {
								departureDate: {
									$gte: new Date(departureDate),
									$lt: new Date(departureDateEnd),
								},
						  }
						: departureDate
						? { departureDate: { $gte: new Date(departureDate) } }
						: {}),
				})
					.populate({
						path: "route",
						populate: [
							{
								path: "departureAirport",
								select: "name city country iata icao tzDatabaseTimezone",
							},
							{
								path: "arrivalAirport",
								select: "name city country iata icao tzDatabaseTimezone",
							},
						],
					})
					.populate({ path: "airline", select: "name code" })
					.populate({ path: "plane", select: "code manifacturer model seats" });
				// Per ogni volo del primo segmento, cerca voli del secondo segmento compatibili
				for (const firstFlight of firstFlights) {
					const minConnectionTime = new Date(firstFlight.arrivalDate);
					minConnectionTime.setMinutes(minConnectionTime.getMinutes() + 30); // almeno 30 min di scalo
					const secondFlights = await Flight.find({
						route: secondLeg._id,
						departureDate: { $gte: minConnectionTime },
						...(returnDate && returnDateEnd
							? {
									arrivalDate: {
										$gte: new Date(returnDate),
										$lt: new Date(returnDateEnd),
									},
							  }
							: returnDate
							? { arrivalDate: { $gte: new Date(returnDate) } }
							: {}),
					})
						.populate({
							path: "route",
							populate: [
								{
									path: "departureAirport",
									select: "name city country iata icao tzDatabaseTimezone",
								},
								{
									path: "arrivalAirport",
									select: "name city country iata icao tzDatabaseTimezone",
								},
							],
						})
						.populate({ path: "airline", select: "name code" })
						.populate({
							path: "plane",
							select: "code manifacturer model seats",
						});
					for (const secondFlight of secondFlights) {
						oneStopResults.push({
							type: "one-stop",
							segments: [firstFlight, secondFlight],
						});
					}
				}
			}
		}

		// Prepara i risultati diretti
		const directResults = directFlights.map((flight) => ({
			type: "direct",
			segments: [flight],
		}));

		return res.status(200).json([...directResults, ...oneStopResults]);
	} catch (error) {
		console.error("❌ Error in searchFlights:", error);
		return res
			.status(500)
			.json({ message: "Server error", error: error.message });
	}
};

module.exports = {
	createFlight,
	getFlights,
	getFlightById,
	getFlightsByAirline,
	updateFlight,
	deleteFlight,
	updateFlightStatus,
	searchFlights,
};
