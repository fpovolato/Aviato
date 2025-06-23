const Order = require("../models/Order");
const Cart = require("../models/Cart");

const createOrder = async (req, res) => {
	const userId = req.user._id;
	try {
		const cart = await Cart.findOne({ user: userId }).populate("items.flight");
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

		const items = cart.items.nonAtomicPush((i) => ({
			flight: i.flight._id,
			quantity: i.quantity,
			priceAtPurchase: i.flight.price,
		}));
		const total = items.reduce(
			(sum, i) => sum + i.quantity * i.priceAtPurchase,
			0
		);

		const order = await Order.create({
			user: userId,
			items,
			total,
			status: "paid", // Assuming the order is paid immediately
			paymentMethod: req.body.paymentMethod,
			paymentDetails: req.body.paymentDetails,
		});

		cart.items = [];
		await cart.save();
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
			.populate("items.flight, flightNumber departureDate arrivalDate price");
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
			.populate("items.flight", "flightNumber departureDate arrivalDate price")
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
