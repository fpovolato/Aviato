const Order = require("../models/Order");
const Flight = require("../models/Flight");
const Route = require("../models/Route");
const Airport = require("../models/Airport");
const Airline = require("../models/Airline");

// Get analytics for employee dashboard
const getDashboardAnalytics = async (req, res) => {
	try {
		const user = req.user;

		// Check if user is admin - admins see only welcome message
		if (user.roles.includes("admin")) {
			return res.status(200).json({
				isAdmin: true,
				message: "Welcome to Aviato Admin Dashboard",
				user: {
					name: user.name,
					surname: user.surname,
					email: user.email,
					roles: user.roles,
				},
			});
		}

		// For employees, get their airline IDs and populate airline details
		const userAirlineIds = user.airlines?.map((airline) => airline._id) || [];

		if (userAirlineIds.length === 0) {
			return res.status(200).json({
				isAdmin: false,
				message: "No airline assigned",
				user: {
					name: user.name,
					surname: user.surname,
					email: user.email,
					roles: user.roles,
				},
			});
		}

		// Populate airline details
		const populatedAirlines = await Airline.find({
			_id: { $in: userAirlineIds },
		}).select("name code _id");

		// Get total passengers for user's airlines
		const totalPassengers = await Order.aggregate([
			{ $match: { status: "Completed" } },
			{ $unwind: "$items" },
			{
				$lookup: {
					from: "flights",
					localField: "items.flight",
					foreignField: "_id",
					as: "flight",
				},
			},
			{ $unwind: "$flight" },
			{ $match: { "flight.airline": { $in: userAirlineIds } } },
			{
				$group: {
					_id: null,
					totalPassengers: { $sum: "$items.passengers" },
				},
			},
		]);

		// Get total revenue for user's airlines
		const totalRevenue = await Order.aggregate([
			{ $match: { status: "Completed" } },
			{ $unwind: "$items" },
			{
				$lookup: {
					from: "flights",
					localField: "items.flight",
					foreignField: "_id",
					as: "flight",
				},
			},
			{ $unwind: "$flight" },
			{ $match: { "flight.airline": { $in: userAirlineIds } } },
			{
				$group: {
					_id: null,
					totalRevenue: {
						$sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] },
					},
				},
			},
		]);

		// Get most popular routes for user's airlines
		const popularRoutes = await Order.aggregate([
			{ $match: { status: "Completed" } },
			{ $unwind: "$items" },
			{
				$lookup: {
					from: "flights",
					localField: "items.flight",
					foreignField: "_id",
					as: "flight",
				},
			},
			{ $unwind: "$flight" },
			{ $match: { "flight.airline": { $in: userAirlineIds } } },
			{
				$lookup: {
					from: "routes",
					localField: "flight.route",
					foreignField: "_id",
					as: "route",
				},
			},
			{ $unwind: "$route" },
			{
				$lookup: {
					from: "airports",
					localField: "route.departureAirport",
					foreignField: "_id",
					as: "departureAirport",
				},
			},
			{
				$lookup: {
					from: "airports",
					localField: "route.arrivalAirport",
					foreignField: "_id",
					as: "arrivalAirport",
				},
			},
			{ $unwind: "$departureAirport" },
			{ $unwind: "$arrivalAirport" },
			{
				$group: {
					_id: {
						routeId: "$route._id",
						routeCode: "$route.code",
						departure: {
							name: "$departureAirport.name",
							city: "$departureAirport.city",
							iata: "$departureAirport.iata",
						},
						arrival: {
							name: "$arrivalAirport.name",
							city: "$arrivalAirport.city",
							iata: "$arrivalAirport.iata",
						},
					},
					bookings: { $sum: "$items.quantity" },
					passengers: { $sum: "$items.passengers" },
					revenue: {
						$sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] },
					},
				},
			},
			{ $sort: { bookings: -1 } },
			{ $limit: 10 },
		]);

		// Get monthly revenue for user's airlines
		const monthlyRevenue = await Order.aggregate([
			{ $match: { status: "Completed" } },
			{ $unwind: "$items" },
			{
				$lookup: {
					from: "flights",
					localField: "items.flight",
					foreignField: "_id",
					as: "flight",
				},
			},
			{ $unwind: "$flight" },
			{ $match: { "flight.airline": { $in: userAirlineIds } } },
			{
				$group: {
					_id: {
						year: { $year: "$purchasedAt" },
						month: { $month: "$purchasedAt" },
					},
					revenue: {
						$sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] },
					},
					orders: { $sum: 1 },
				},
			},
			{ $sort: { "_id.year": 1, "_id.month": 1 } },
			{ $limit: 12 },
		]);

		// Get recent orders count for user's airlines
		const recentOrders = await Order.aggregate([
			{
				$match: {
					status: "Completed",
					purchasedAt: {
						$gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
					},
				},
			},
			{ $unwind: "$items" },
			{
				$lookup: {
					from: "flights",
					localField: "items.flight",
					foreignField: "_id",
					as: "flight",
				},
			},
			{ $unwind: "$flight" },
			{ $match: { "flight.airline": { $in: userAirlineIds } } },
			{
				$group: {
					_id: null,
					count: { $sum: 1 },
				},
			},
		]);

		// Get upcoming flights count for user's airlines
		const upcomingFlights = await Flight.countDocuments({
			departureDate: { $gte: new Date() },
			status: "scheduled",
			airline: { $in: userAirlineIds },
		});

		const analytics = {
			isAdmin: false,
			totalPassengers: totalPassengers[0]?.totalPassengers || 0,
			totalRevenue: totalRevenue[0]?.totalRevenue || 0,
			popularRoutes: popularRoutes.map((route) => ({
				routeCode: route._id.routeCode,
				departure: route._id.departure,
				arrival: route._id.arrival,
				bookings: route.bookings,
				passengers: route.passengers,
				revenue: route.revenue,
			})),
			monthlyRevenue: monthlyRevenue.map((month) => ({
				year: month._id.year,
				month: month._id.month,
				revenue: month.revenue,
				orders: month.orders,
			})),
			recentOrders: recentOrders[0]?.count || 0,
			upcomingFlights,
			user: {
				name: user.name,
				surname: user.surname,
				email: user.email,
				roles: user.roles,
				airlines: populatedAirlines,
			},
		};

		res.status(200).json(analytics);
	} catch (error) {
		console.error("❌ Error fetching analytics:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Get analytics for a specific airline (if needed for airline employees)
const getAirlineAnalytics = async (req, res) => {
	try {
		const { airlineId } = req.params;

		// Get airline-specific analytics
		const airlinePassengers = await Order.aggregate([
			{ $match: { status: "Completed" } },
			{ $unwind: "$items" },
			{
				$lookup: {
					from: "flights",
					localField: "items.flight",
					foreignField: "_id",
					as: "flight",
				},
			},
			{ $unwind: "$flight" },
			{ $match: { "flight.airline": airlineId } },
			{
				$group: {
					_id: null,
					totalPassengers: { $sum: "$items.passengers" },
					totalRevenue: {
						$sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] },
					},
				},
			},
		]);

		const airlineRoutes = await Order.aggregate([
			{ $match: { status: "Completed" } },
			{ $unwind: "$items" },
			{
				$lookup: {
					from: "flights",
					localField: "items.flight",
					foreignField: "_id",
					as: "flight",
				},
			},
			{ $unwind: "$flight" },
			{ $match: { "flight.airline": airlineId } },
			{
				$lookup: {
					from: "routes",
					localField: "flight.route",
					foreignField: "_id",
					as: "route",
				},
			},
			{ $unwind: "$route" },
			{
				$lookup: {
					from: "airports",
					localField: "route.departureAirport",
					foreignField: "_id",
					as: "departureAirport",
				},
			},
			{
				$lookup: {
					from: "airports",
					localField: "route.arrivalAirport",
					foreignField: "_id",
					as: "arrivalAirport",
				},
			},
			{ $unwind: "$departureAirport" },
			{ $unwind: "$arrivalAirport" },
			{
				$group: {
					_id: {
						routeId: "$route._id",
						routeCode: "$route.code",
						departure: {
							name: "$departureAirport.name",
							city: "$departureAirport.city",
							iata: "$departureAirport.iata",
						},
						arrival: {
							name: "$arrivalAirport.name",
							city: "$arrivalAirport.city",
							iata: "$arrivalAirport.iata",
						},
					},
					bookings: { $sum: "$items.quantity" },
					passengers: { $sum: "$items.passengers" },
					revenue: {
						$sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] },
					},
				},
			},
			{ $sort: { bookings: -1 } },
			{ $limit: 10 },
		]);

		const analytics = {
			totalPassengers: airlinePassengers[0]?.totalPassengers || 0,
			totalRevenue: airlinePassengers[0]?.totalRevenue || 0,
			popularRoutes: airlineRoutes.map((route) => ({
				routeCode: route._id.routeCode,
				departure: route._id.departure,
				arrival: route._id.arrival,
				bookings: route.bookings,
				passengers: route.passengers,
				revenue: route.revenue,
			})),
		};

		res.status(200).json(analytics);
	} catch (error) {
		console.error("❌ Error fetching airline analytics:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

module.exports = {
	getDashboardAnalytics,
	getAirlineAnalytics,
};
