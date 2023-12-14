const express = require("express");
const router = express.Router();
const promotionController = require("../controller/promotionController");
const authenticateToken = require("../middleWare/auth"); // Assuming you have an authentication middleware

// Create a new promotion
router.post(
  "/rooms",
  authenticateToken,
  promotionController.createPromotion
);

// Get all promotions
router.get(
  "/rooms",
  authenticateToken,
  promotionController.getAllPromotions
);

// Delete a promotion by UUID
router.delete(
  "/rooms/:id",
  authenticateToken,
  promotionController.deletePromotion
);

module.exports = router;
