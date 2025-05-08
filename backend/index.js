const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const usersRoutes = require("./routes/userRoutes");
const airlinesRoutes = require("./routes/airlineRoutes");
const planeRoutes = require("./routes/planeRoutes");
const airportRoutes = require("./routes/airportRoutes");

const cors = require("cors");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", usersRoutes);
app.use("/api/airlines", airlinesRoutes);
app.use("/api/planes", planeRoutes);
app.use("/api/airports", airportRoutes);

require("./config/db")();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
