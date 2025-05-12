const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const usersRoutes = require("./routes/userRoutes");
const airlinesRoutes = require("./routes/airlineRoutes");
const planeRoutes = require("./routes/planeRoutes");
const airportRoutes = require("./routes/airportRoutes");
const flightRoutes = require("./routes/flightRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

const cors = require("cors");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", usersRoutes);
app.use("/api/airlines", airlinesRoutes);
app.use("/api/planes", planeRoutes);
app.use("/api/airports", airportRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

require("./config/db")();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
