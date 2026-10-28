const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const SeatReservation = require("../models/SeatReservation");
const Flight = require("../models/Flight");
const Plane = require("../models/Plane");

const roundPrice = (value) => Math.round(value * 100) / 100;

// Seat selection fee, same formula used by seatController
const seatSelectionPrice = (flight, seatClass) =>
	roundPrice(
		(seatClass === "first" ? flight.firstClassPrice : flight.price) * 0.1
	);

/**
 * @openapi
 * tags: [Orders]
 * summary: Create order from body or backend cart
 * security: [{ cookieAuth: [] }]
 * requestBody:
 *   required: false
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         properties:
 *           items:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 flight: { type: string }
 *                 quantity: { type: integer }
 *                 additionalLuggage: { type: integer }
 *                 seatClass: { type: string }
 *                 passengers: { type: integer }
 *                 selectedSeats: { type: array }
 *           total: { type: number }
 *           paymentMethod: { type: string }
 *           paymentDetails: { type: object }
 * responses:
 *   201: { description: Created }
 *   400: { description: Cart empty or validation error }
 */
const createOrder = async (req, res) => {
	const userId = req.user._id || req.user.id;
	try {
		// Only the user's choices are taken from the client: prices, totals and
		// flight details are always recomputed from the database
		let requestedItems = [];

		if (req.body.items && req.body.items.length > 0) {
			// Use items from request body (frontend cart)
			requestedItems = req.body.items.map((item) => ({
				flight: item.flight,
				passengers: item.passengers || item.quantity || 1,
				seatClass: item.seatClass || "economy",
				additionalLuggage: item.additionalLuggage || 0,
				selectedSeats: item.selectedSeats || [],
			}));
		} else {
			// Fallback to backend cart
			const cart = await Cart.findOne({ user: userId });
			if (!cart || cart.items.length === 0) {
				return res.status(400).json({ message: "Cart is empty" });
			}
			requestedItems = cart.items.map((i) => ({
				flight: i.flight,
				passengers: i.quantity,
				seatClass: "economy",
				additionalLuggage: 0,
				selectedSeats: [],
			}));
		}

		const items = [];
		const planeByFlight = new Map();
		const takenSeats = new Set();

		for (const requested of requestedItems) {
			const passengers = Number(requested.passengers);
			const additionalLuggage = Number(requested.additionalLuggage);
			const { seatClass } = requested;

			if (!Number.isInteger(passengers) || passengers < 1) {
				return res.status(400).json({ message: "Invalid number of passengers" });
			}
			if (!Number.isInteger(additionalLuggage) || additionalLuggage < 0) {
				return res.status(400).json({ message: "Invalid additional luggage" });
			}
			if (!["economy", "first"].includes(seatClass)) {
				return res.status(400).json({ message: "Invalid seat class" });
			}
			if (!mongoose.isValidObjectId(requested.flight)) {
				return res.status(400).json({ message: "Invalid flight id" });
			}

			const flight = await Flight.findById(requested.flight)
				.populate("plane")
				.populate("airline", "name code")
				.populate({
					path: "route",
					populate: [
						{ path: "departureAirport", select: "name iata" },
						{ path: "arrivalAirport", select: "name iata" },
					],
				});
			if (!flight || !flight.plane) {
				return res.status(400).json({
					message: `Cannot find aircraft for flight ${requested.flight}`,
				});
			}
			if (passengers > flight.seatsAvailable) {
				return res.status(400).json({
					message: `Not enough seats available for flight ${flight.flightNumber}`,
				});
			}

			let selectedSeats = [];

			if (requested.selectedSeats.length > 0) {
				if (requested.selectedSeats.length !== passengers) {
					return res.status(400).json({
						message: `The number of selected seats (${requested.selectedSeats.length}) must match the number of passengers (${passengers}) for flight ${flight.flightNumber}`,
					});
				}

				for (const [index, requestedSeat] of requested.selectedSeats.entries()) {
					const seat = flight.plane.seatsConfiguration.find(
						(s) =>
							s.row === requestedSeat.seatRow &&
							s.number === Number(requestedSeat.seatNumber)
					);
					const key = `${flight._id}-${requestedSeat.seatRow}-${requestedSeat.seatNumber}`;
					if (!seat || takenSeats.has(key)) {
						return res.status(400).json({
							message: `Invalid seat ${requestedSeat.seatRow}${requestedSeat.seatNumber} for flight ${flight.flightNumber}`,
						});
					}

					const isAvailable = await SeatReservation.isSeatAvailable(
						flight._id,
						seat.row,
						seat.number
					);
					if (!isAvailable) {
						return res.status(400).json({
							message: `Seat ${seat.row}${seat.number} is not available for flight ${flight.flightNumber}`,
						});
					}

					takenSeats.add(key);
					selectedSeats.push({
						passengerNumber: index + 1,
						seatRow: seat.row,
						seatNumber: seat.number,
						seatClass: seat.seatClass,
						price: seatSelectionPrice(flight, seat.seatClass),
					});
				}
			} else {
				// No seats chosen: assign random free seats of the booked class at no extra cost
				const reserved = await SeatReservation.find({
					flight: flight._id,
					status: { $in: ["reserved", "confirmed"] },
				}).select("seatRow seatNumber");
				const occupied = new Set(
					reserved.map((r) => `${flight._id}-${r.seatRow}-${r.seatNumber}`)
				);

				const availableSeats = flight.plane.seatsConfiguration.filter(
					(seat) => {
						const key = `${flight._id}-${seat.row}-${seat.number}`;
						return (
							seat.seatClass === seatClass &&
							seat.isAvailable &&
							!occupied.has(key) &&
							!takenSeats.has(key)
						);
					}
				);

				if (availableSeats.length < passengers) {
					return res.status(400).json({
						message: `Not enough seats available for class ${seatClass} on flight ${flight.flightNumber}`,
					});
				}

				const shuffledSeats = availableSeats.sort(() => 0.5 - Math.random());
				selectedSeats = shuffledSeats.slice(0, passengers).map((seat, index) => {
					takenSeats.add(`${flight._id}-${seat.row}-${seat.number}`);
					return {
						passengerNumber: index + 1,
						seatRow: seat.row,
						seatNumber: seat.number,
						seatClass: seat.seatClass,
						price: 0,
					};
				});
			}

			const priceAtPurchase =
				seatClass === "first" ? flight.firstClassPrice : flight.price;
			const additionalLuggagePrice = flight.additionalLuggagePrice || 0;

			items.push({
				flight: flight._id,
				flightInfo: {
					flightNumber: flight.flightNumber,
					from:
						flight.route?.departureAirport?.iata ||
						flight.route?.departureAirport?.name,
					to:
						flight.route?.arrivalAirport?.iata ||
						flight.route?.arrivalAirport?.name,
					departureDate: flight.departureDate.toISOString(),
					arrivalDate: flight.arrivalDate.toISOString(),
					airline: {
						name: flight.airline?.name,
						code: flight.airline?.code,
					},
					price: flight.price,
					firstClassPrice: flight.firstClassPrice,
					additionalLuggagePrice,
				},
				quantity: passengers,
				priceAtPurchase,
				additionalLuggage,
				additionalLuggagePrice,
				seatClass,
				passengers,
				selectedSeats,
			});
			planeByFlight.set(String(flight._id), flight.plane._id);
		}

		const total = roundPrice(
			items.reduce(
				(sum, item) =>
					sum +
					item.priceAtPurchase * item.passengers +
					item.additionalLuggagePrice * item.additionalLuggage +
					item.selectedSeats.reduce((s, seat) => s + seat.price, 0),
				0
			)
		);

		const order = new Order({
			user: userId,
			items,
			total,
			status: "Completed", // Assuming the order is paid immediately
			paymentMethod: req.body.paymentMethod,
			paymentDetails: req.body.paymentDetails,
		});
		try {
			await order.validate();
		} catch (validationError) {
			return res.status(400).json({ message: validationError.message });
		}

		// Decrement availability and book seats before saving the order, undoing
		// everything if any step fails so no seats or counters are left behind
		const decremented = [];
		const reservations = [];
		const rollback = async () => {
			for (const done of decremented) {
				await Flight.updateOne(
					{ _id: done.flight },
					{ $inc: { seatsAvailable: done.passengers } }
				);
			}
			if (reservations.length > 0) {
				await SeatReservation.deleteMany({
					_id: { $in: reservations.map((r) => r._id) },
				});
			}
		};

		try {
			for (const item of items) {
				// Atomic check-and-decrement so concurrent orders cannot oversell
				const result = await Flight.updateOne(
					{ _id: item.flight, seatsAvailable: { $gte: item.passengers } },
					{ $inc: { seatsAvailable: -item.passengers } }
				);
				if (result.modifiedCount === 0) {
					await rollback();
					return res.status(400).json({
						message: `Not enough seats available for flight ${item.flightInfo.flightNumber}`,
					});
				}
				decremented.push(item);

				for (const seat of item.selectedSeats) {
					reservations.push(
						await SeatReservation.create({
							flight: item.flight,
							user: userId,
							plane: planeByFlight.get(String(item.flight)),
							seatRow: seat.seatRow,
							seatNumber: seat.seatNumber,
							seatClass: seat.seatClass,
							price: seat.price,
							status: "confirmed",
							expiresAt: null, // For confirmed reservations, no expiration
						})
					);
				}
			}

			await order.save();
		} catch (bookingError) {
			await rollback();
			if (bookingError.code === 11000) {
				return res
					.status(400)
					.json({ message: "One of the selected seats was just taken" });
			}
			throw bookingError;
		}

		// Clear backend cart if it exists
		const cart = await Cart.findOne({ user: userId });
		if (cart) {
			cart.items = [];
			await cart.save();
		}

		const populatedOrder = await Order.findById(order._id)
			.populate("user", "name email")
			.populate({
				path: "items.flight",
				select:
					"flightNumber departureDate arrivalDate price from to airline route",
				populate: {
					path: "route",
					select: "departureAirport arrivalAirport",
					populate: [
						{
							path: "departureAirport",
							select: "name city iata",
						},
						{
							path: "arrivalAirport",
							select: "name city iata",
						},
					],
				},
			})
			.populate({
				path: "items.flight.airline",
				select: "name code",
			});

		res.status(201).json(populatedOrder);
	} catch (error) {
		console.error("Error creating order:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Orders]
 * summary: List all orders (admin)
 * security: [{ cookieAuth: [] }]
 */
const getOrders = async (req, res) => {
	try {
		const orders = await Order.find()
			.populate("user", "name email")
			.sort({ purchasedAt: -1 });
		res.status(200).json(orders);
	} catch (error) {
		console.error("Error fetching orders:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Orders]
 * summary: Get order by id
 * security: [{ cookieAuth: [] }]
 * parameters:
 *   - in: path
 *     name: id
 *     required: true
 *     schema: { type: string }
 */
const getOrderById = async (req, res) => {
	try {
		const order = await Order.findById(req.params.id)
			.populate("user", "name email")
			.populate({
				path: "items.flight",
				select:
					"flightNumber departureDate arrivalDate price from to airline route",
				populate: {
					path: "route",
					select: "departureAirport arrivalAirport",
					populate: [
						{
							path: "departureAirport",
							select: "name city iata",
						},
						{
							path: "arrivalAirport",
							select: "name city iata",
						},
					],
				},
			})
			.populate({
				path: "items.flight.airline",
				select: "name code",
			});
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}
		res.status(200).json(order);
	} catch (error) {
		console.error("Error fetching order:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Orders]
 * summary: Get current user's orders
 * security: [{ cookieAuth: [] }]
 */
const getUserOrders = async (req, res) => {
	try {
		const userId = req.user._id;
		const orders = await Order.find({ user: userId })
			.populate({
				path: "items.flight",
				select: "flightNumber departureDate arrivalDate airline price route",
				populate: {
					path: "route",
					select: "departureAirport arrivalAirport",
					populate: [
						{
							path: "departureAirport",
							select: "name city iata",
						},
						{
							path: "arrivalAirport",
							select: "name city iata",
						},
					],
				},
			})
			.populate({
				path: "items.flight.airline",
				select: "name code",
			})
			.sort({ purchasedAt: -1 });
		res.status(200).json(orders);
	} catch (error) {
		console.error("Error fetching user orders:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @openapi
 * tags: [Orders]
 * summary: Update order status (admin)
 * security: [{ cookieAuth: [] }]
 * parameters:
 *   - in: path
 *     name: id
 *     required: true
 *     schema: { type: string }
 */
const updateOrderStatus = async (req, res) => {
	try {
		const order = await Order.findById(req.params.id);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}
		const { status } = req.body;
		order.status = status;
		await order.save();
		res.status(200).json(order);
	} catch (error) {
		console.error("Error updating order status:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

module.exports = {
	createOrder,
	getOrders,
	getOrderById,
	getUserOrders,
	updateOrderStatus,
};
