const express = require('express');
const router = express.Router();
const { createAirline, getAirlines, getAirlineById } = require('../controllers/airlineController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, adminOnly, createAirline);

router.get('/', getAirlines);

router.get('/:id', getAirlineById);

module.exports = router;