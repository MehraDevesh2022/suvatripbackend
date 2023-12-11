const express = require("express");
const router = express.Router();
const promotionController = require("../controller/promotionController");
const authenticateToken = require("../middleware/auth"); // Assuming you have an authentication middleware

// Create a new promotion
router.post(
  "/promotions",
  authenticateToken,
  promotionController.createPromotion
);

// Get all promotions
router.get(
  "/promotions",
  authenticateToken,
  promotionController.getAllPromotions
);

// Get a specific promotion by UUID
router.get(
  "/promotions/:id",
  authenticateToken,
  promotionController.getPromotionById
);

// Update a promotion by UUID
router.patch(
  "/promotions/:id",
  authenticateToken,
  promotionController.updatePromotion
);

// Delete a promotion by UUID
router.delete(
  "/promotions/:id",
  authenticateToken,
  promotionController.deletePromotion
);

module.exports = router;
