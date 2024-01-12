const express = require("express");
const router = express.Router();
const bookingController = require("../controller/bookingController");
const authenticateToken = require("../middleWare/auth"); // Assuming you have an authentication middleware

// Create a new promotion
router.post("/", authenticateToken, bookingController.createBooking);

// Get all promotions
router.get("/:id", authenticateToken, bookingController.getAllBookings);

// Update a promotion by UUID
router.patch("/:id", authenticateToken, bookingController.updateBooking);

// Delete a promotion by UUID
router.delete("/:id", authenticateToken, bookingController.deleteBooking);

module.exports = router;
