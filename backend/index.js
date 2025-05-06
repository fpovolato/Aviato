const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const usersRoutes = require('./routes/userRoutes');
const airlinesRoutes = require('./routes/airlineRoutes');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRoutes);
app.use('/api/airlines', airlinesRoutes);

require('./config/db')();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
