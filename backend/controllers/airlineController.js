const Airline = require('../models/Airline');

const createAirline = async (req, res) => {
    const { name, code } = req.body;

    try {
        const airlineExists = await Airline.findOne({ code });

        if (airlineExists) {
            return res.status(400).json({ message: 'Airline already exists' });
        }

        const airline = await Airline.create({
            name,
            code,
            admins: [req.user._id],
        });

        res.status(201).json(airline);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getAirlines = async (req, res) => {
    try {
        const airlines = await Airline.find().populate('admins', 'name email');
        res.json(airlines);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getAirlineById = async (req, res) => {
    try {
        const airline = await Airline.findById(req.params.id).populate('admins', 'name email');

        if (airline) {
            res.json(airline);
        } else {
            res.status(404).json({ message: 'Airline not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createAirline,
    getAirlines,
    getAirlineById,
};