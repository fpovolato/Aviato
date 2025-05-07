const express = require('express');
const router = express.Router();
const {
    createAirline,
    getAirlines,
    getAirlineById,
    inviteEmployee,
    getAllEmployees,
    getEmployeesByAirline,
} = require('../controllers/airlineController');
const {protect, adminOnly} = require('../middleware/auth');

router.post('/', protect, adminOnly, createAirline);

router.post('/invite', protect, inviteEmployee);

router.get('/', protect, getAirlines);

router.get('/:id', protect, getAirlineById);

router.get('/employees/all', protect, adminOnly, getAllEmployees);

router.get('/employees/:airlineId', protect, getEmployeesByAirline);

module.exports = router;