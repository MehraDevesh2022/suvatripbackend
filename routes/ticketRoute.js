
const express = require('express');
const router = express.Router();
const ticketController = require('../controller/ticketController');

// Create a new ticket
router.post('/create', ticketController.createTicket);

// Get all tickets
// router.get('/get', ticketController.getTickets);

module.exports = router;
