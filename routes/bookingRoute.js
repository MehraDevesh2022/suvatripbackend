const express = require("express");
const router = express.Router();
const bookingController = require("../controller/bookingController");
const authenticateToken = require("../middleWare/auth"); // Assuming you have an authentication middleware

// Create a new promotion
router.post(
  "/",
  authenticateToken,
  promotionController.createBooking
);

// Get all promotions
router.get(
  "/:id",
  authenticateToken,
  promotionController.getAllBookings
);

// Update a promotion by UUID
router.patch(
  "/:id",
  authenticateToken,
  promotionController.updateBooking
);

// Delete a promotion by UUID
router.delete(
  "/:id",
  authenticateToken,
  promotionController.deleteBooking
);

module.exports = router;
