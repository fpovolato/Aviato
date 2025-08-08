const mongoose = require("mongoose");
const Flight = require("../models/Flight");
const Airline = require("../models/Airline");
const Plane = require("../models/Plane");
const Route = require("../models/Route");

/**
 * @openapi
 * tags: [Flights]
 * summary: Create a flight
 * security: [{ cookieAuth: [] }]
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required: [flightNumber, route, departureDate, arrivalDate, airline]
 *         properties:
 *           flightNumber: { type: string }
 *           route: { type: string }
 *           departureDate: { type: string, format: date-time }
 *           arrivalDate: { type: string, format: date-time }
 *           airline: { type: string }
 *           plane: { type: string }
 *           status: { type: string, enum: [scheduled, delayed, cancelled, departed, landed] }
 *           price: { type: number }
 *           firstClassPrice: { type: number }
 *           additionalLuggagePrice: { type: number }
 * responses:
 *   201: { description: Created }
 *   400: { description: Validation error }
 */
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

		// Scope: employee/manager can only create for their airline
		const requester = req.user;
		const isAdmin = requester.roles.includes("admin");
		if (!isAdmin) {
			const allowedAirlineIds = (requester.airlines || []).map((a) => a.toString());
			if (!allowedAirlineIds.includes(String(airline))) {
				return res.status(403).json({ message: "Access denied for this airline" });
			}
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

/**
 * @openapi
 * tags: [Flights]
 * summary: List flights
 * responses:
 *   200: { description: OK }
 */
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

/**
 * @openapi
 * tags: [Flights]
 * summary: Get flight by id
 * parameters:
 *   - in: path
 *     name: id
 *     required: true
 *     schema: { type: string }
 * responses:
 *   200: { description: OK }
 *   404: { description: Not found }
 */
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

/**
 * @openapi
 * tags: [Flights]
 * summary: List flights by airline
 * parameters:
 *   - in: path
 *     name: id
 *     required: true
 *     schema: { type: string }
 */
const getFlightsByAirline = async (req, res) => {
    try {
        const requestedAirlineId = req.params.id;

        const requester = req.user;
        const isAdmin = requester.roles.includes("admin");
        const belongsToAirline = (requester.airlines || []).map((a) => a.toString()).includes(requestedAirlineId);
        if (!isAdmin && !belongsToAirline) {
            return res.status(403).json({ message: "Access denied" });
        }

        const flights = await Flight.find({ airline: requestedAirlineId })
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

/**
 * @openapi
 * tags: [Flights]
 * summary: Update flight
 * security: [{ cookieAuth: [] }]
 * parameters:
 *   - in: path
 *     name: id
 *     required: true
 *     schema: { type: string }
 */
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

		// Admin only via route guard, but keep defense-in-depth for managers/employees if route changes
		const requester = req.user;
		const isAdmin = requester.roles.includes("admin");
		if (!isAdmin) {
			const allowedAirlineIds = (requester.airlines || []).map((a) => a.toString());
			if (!allowedAirlineIds.includes(String(flight.airline))) {
				return res.status(403).json({ message: "Access denied for this airline" });
			}
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

/**
 * @openapi
 * tags: [Flights]
 * summary: Delete flight
 * security: [{ cookieAuth: [] }]
 * parameters:
 *   - in: path
 *     name: id
 *     required: true
 *     schema: { type: string }
 */
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

/**
 * @openapi
 * tags: [Flights]
 * summary: Update flight status
 * security: [{ cookieAuth: [] }]
 * parameters:
 *   - in: path
 *     name: id
 *     required: true
 *     schema: { type: string }
 */
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

/**
 * @openapi
 * tags: [Flights]
 * summary: Search flights (direct and one-stop)
 * parameters:
 *   - in: query
 *     name: from
 *     schema: { type: string }
 *   - in: query
 *     name: to
 *     schema: { type: string }
 *   - in: query
 *     name: departureDate
 *     schema: { type: string, format: date-time }
 *   - in: query
 *     name: departureDateEnd
 *     schema: { type: string, format: date-time }
 *   - in: query
 *     name: returnDate
 *     schema: { type: string, format: date-time }
 *   - in: query
 *     name: returnDateEnd
 *     schema: { type: string, format: date-time }
 * responses:
 *   200: { description: OK }
 *   400: { description: Missing parameters }
 */
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

		// Get current date and time to exclude past flights
		const currentDate = new Date();

		// Trova tutte le rotte dirette
		const directRoutes = await Route.find({
			departureAirport: from,
			arrivalAirport: to,
		}).select("_id");
		const directRouteIds = directRoutes.map((r) => r._id);
		let flightQuery = { route: { $in: directRouteIds } };

		// Add current date filter to exclude past flights
		flightQuery["departureDate"] = { $gte: currentDate };

		if (departureDate && departureDateEnd) {
			flightQuery["departureDate"] = {
				$gte: new Date(
					Math.max(new Date(departureDate).getTime(), currentDate.getTime())
				),
				$lt: new Date(departureDateEnd),
			};
		} else if (departureDate) {
			const requestedDate = new Date(departureDate);
			flightQuery["departureDate"] = {
				$gte: new Date(
					Math.max(requestedDate.getTime(), currentDate.getTime())
				),
			};
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
				let firstFlightQuery = {
					route: firstLeg._id,
					departureDate: { $gte: currentDate }, // Add current date filter
				};

				if (departureDate && departureDateEnd) {
					firstFlightQuery["departureDate"] = {
						$gte: new Date(
							Math.max(new Date(departureDate).getTime(), currentDate.getTime())
						),
						$lt: new Date(departureDateEnd),
					};
				} else if (departureDate) {
					const requestedDate = new Date(departureDate);
					firstFlightQuery["departureDate"] = {
						$gte: new Date(
							Math.max(requestedDate.getTime(), currentDate.getTime())
						),
					};
				}

				const firstFlights = await Flight.find(firstFlightQuery)
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
					minConnectionTime.setMinutes(minConnectionTime.getMinutes() + 120); // almeno 120 min di scalo

					let secondFlightQuery = {
						route: secondLeg._id,
						departureDate: { $gte: minConnectionTime },
					};

					if (returnDate && returnDateEnd) {
						secondFlightQuery["arrivalDate"] = {
							$gte: new Date(returnDate),
							$lt: new Date(returnDateEnd),
						};
					} else if (returnDate) {
						secondFlightQuery["arrivalDate"] = { $gte: new Date(returnDate) };
					}

					const secondFlights = await Flight.find(secondFlightQuery)
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
