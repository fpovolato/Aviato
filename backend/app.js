require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const usersRoutes = require("./routes/userRoutes");
const airlinesRoutes = require("./routes/airlineRoutes");
const planesRoutes = require("./routes/planeRoutes");
const airportsRoutes = require("./routes/airportRoutes");
const flightsRoutes = require("./routes/flightRoutes");
const cartRoutes = require("./routes/cartRoutes");
const ordersRoutes = require("./routes/orderRoutes");
const routeRoutes = require("./routes/routeRoutes");
const seatRoutes = require("./routes/seatRoutes");

connectDB();

const app = express();

app.use(
	cors({
		origin: [
			"http://localhost:4200",
			"https://localhost:4443",
			"https://localhost:4543",
			"http://localhost:3000",
			"https://localhost:3443",
		],
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	})
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/users", usersRoutes);
app.use("/api/airlines", airlinesRoutes);
app.use("/api/planes", planesRoutes);
app.use("/api/airports", airportsRoutes);
app.use("/api/flights", flightsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/seats", seatRoutes);

module.exports = app;
