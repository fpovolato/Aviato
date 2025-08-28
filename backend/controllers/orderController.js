const Order = require("../models/Order");
const Cart = require("../models/Cart");
const SeatReservation = require("../models/SeatReservation");
const Flight = require("../models/Flight");
const Plane = require("../models/Plane");

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
		let items = [];
		let total = 0;

		if (req.body.items && req.body.items.length > 0) {
			// Use items from request body (frontend cart)
			items = req.body.items.map((item) => ({
				...item,
				additionalLuggage: item.additionalLuggage || 0,
				additionalLuggagePrice: item.additionalLuggagePrice || 0,
				seatClass: item.seatClass || "economy",
				passengers: item.passengers || item.quantity || 1,
				flightInfo: item.flightInfo || null,
				selectedSeats: item.selectedSeats || [],
			}));
			total = req.body.total || 0;
		} else {
			// Fallback to backend cart
			const cart = await Cart.findOne({ user: userId }).populate(
				"items.flight"
			);
			if (!cart || cart.items.length === 0) {
				return res.status(400).json({ message: "Cart is empty" });
			}

			for (const item of cart.items) {
				if (item.quantity > item.flight.seatsAvailable) {
					return res.status(400).json({
						message: `Not enough seats available for flight ${item.flight.flightNumber}`,
					});
				}
			}
			for (const item of cart.items) {
				item.flight.seatsAvailable -= item.quantity;
				await item.flight.save();
			}

			items = cart.items.map((i) => ({
				flight: i.flight._id,
				quantity: i.quantity,
				priceAtPurchase: i.flight.price,
				additionalLuggage: i.additionalLuggage || 0,
				additionalLuggagePrice: i.flight.additionalLuggagePrice || 0,
				seatClass: i.seatClass || "economy",
				passengers: i.quantity,
				selectedSeats: [],
			}));
			total = items.reduce((sum, i) => sum + i.quantity * i.priceAtPurchase, 0);
		}

		for (const item of items) {
			if (item.selectedSeats && item.selectedSeats.length > 0) {
				if (item.selectedSeats.length !== item.passengers) {
					return res.status(400).json({
						message: `The number of selected seats (${item.selectedSeats.length}) must match the number of passengers (${item.passengers}) for flight ${item.flight}`,
					});
				}

				for (const seat of item.selectedSeats) {
					const isAvailable = await SeatReservation.isSeatAvailable(
						item.flight,
						seat.seatRow,
						seat.seatNumber
					);
					if (!isAvailable) {
						return res.status(400).json({
							message: `Seat ${seat.seatRow}${seat.seatNumber} is not available for flight ${item.flight}`,
						});
					}
				}
			} else {
				const flight = await Flight.findById(item.flight).populate("plane");
				if (!flight || !flight.plane) {
					return res.status(400).json({
						message: `Cannot find aircraft for flight ${item.flight}`,
					});
				}

				const availableSeats = flight.plane.seatsConfiguration.filter(
					(seat) =>
						seat.seatClass === item.seatClass &&
						!seat.isReserved &&
						seat.isAvailable
				);

				if (availableSeats.length < item.passengers) {
					return res.status(400).json({
						message: `Not enough seats available for class ${item.seatClass} on flight ${item.flight}`,
					});
				}

				const shuffledSeats = availableSeats.sort(() => 0.5 - Math.random());
				item.selectedSeats = shuffledSeats
					.slice(0, item.passengers)
					.map((seat, index) => ({
						passengerNumber: index + 1,
						seatRow: seat.row,
						seatNumber: seat.number,
						seatClass: seat.seatClass,
						price:
							seat.seatClass === "first"
								? flight.firstClassPrice
								: flight.price,
					}));
			}
		}

		const order = await Order.create({
			user: userId,
			items,
			total,
			status: "Completed", // Assuming the order is paid immediately
			paymentMethod: req.body.paymentMethod,
			paymentDetails: req.body.paymentDetails,
		});

		for (const item of items) {
			const flightWithPlane = await Flight.findById(item.flight).populate(
				"plane"
			);
			if (!flightWithPlane || !flightWithPlane.plane) {
				return res.status(400).json({
					message: `Cannot find plane for flight ${item.flight}`,
				});
			}

			for (const seat of item.selectedSeats) {
				await SeatReservation.create({
					flight: item.flight,
					user: userId,
					plane: flightWithPlane.plane._id,
					seatRow: seat.seatRow,
					seatNumber: seat.seatNumber,
					seatClass: seat.seatClass,
					price: seat.price,
					status: "confirmed",
					expiresAt: null, // For confirmed reservations, no expiration
				});
			}
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
