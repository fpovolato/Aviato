const Order = require("../models/Order");
const Cart = require("../models/Cart");
const SeatReservation = require("../models/SeatReservation");

const createOrder = async (req, res) => {
	const userId = req.user._id || req.user.id;
	try {
		let items = [];
		let total = 0;

		// Check if order data is provided directly in request body
		if (req.body.items && req.body.items.length > 0) {
			// Use items from request body (frontend cart)
			items = req.body.items.map((item) => ({
				...item,
				additionalLuggage: item.additionalLuggage || 0,
				seatClass: item.seatClass || "economy",
				passengers: item.passengers || item.quantity || 1,
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

			// Controllo e aggiornamento posti disponibili
			for (const item of cart.items) {
				if (item.quantity > item.flight.seatsAvailable) {
					return res.status(400).json({
						message: `Non ci sono abbastanza posti disponibili per il volo ${item.flight.flightNumber}`,
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
				seatClass: i.seatClass || "economy",
				passengers: i.quantity,
			}));
			total = items.reduce((sum, i) => sum + i.quantity * i.priceAtPurchase, 0);
		}

		const order = await Order.create({
			user: userId,
			items,
			total,
			status: "Completed", // Assuming the order is paid immediately
			paymentMethod: req.body.paymentMethod,
			paymentDetails: req.body.paymentDetails,
		});

		// Gestisci le prenotazioni dei posti se presenti
		if (req.body.seatReservations && req.body.seatReservations.length > 0) {
			for (const seatReservation of req.body.seatReservations) {
				await SeatReservation.create({
					flight: seatReservation.flight,
					user: userId,
					plane: seatReservation.plane || "default-plane-id",
					seatRow: seatReservation.seatRow,
					seatNumber: seatReservation.seatNumber,
					seatClass: seatReservation.seatClass,
					price: seatReservation.price,
					status: "confirmed",
					isAisle: seatReservation.isAisle || false,
					isWindow: seatReservation.isWindow || false,
					isEmergencyExit: seatReservation.isEmergencyExit || false,
					isBulkhead: seatReservation.isBulkhead || false,
				});
			}
		}

		// Clear backend cart if it exists
		const cart = await Cart.findOne({ user: userId });
		if (cart) {
			cart.items = [];
			await cart.save();
		}

		res.status(201).json(order);
	} catch (error) {
		console.error("❌ Error creating order:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

const getOrders = async (req, res) => {
	try {
		const orders = await Order.find()
			.populate("user", "name email")
			.sort({ purchasedAt: -1 });
		res.status(200).json(orders);
	} catch (error) {
		console.error("❌ Error fetching orders:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

const getOrderById = async (req, res) => {
	try {
		const order = await Order.findById(req.params.id)
			.populate("user", "name email")
			.populate(
				"items.flight",
				"flightNumber departureDate arrivalDate price from to airline"
			);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}
		res.status(200).json(order);
	} catch (error) {
		console.error("❌ Error fetching order:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

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
			.sort({ purchasedAt: -1 });
		res.status(200).json(orders);
	} catch (error) {
		console.error("❌ Error fetching user orders:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

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
		console.error("❌ Error updating order status:", error);
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
