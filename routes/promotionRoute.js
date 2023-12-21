const express = require("express");
const router = express.Router();
const promotionController = require("../controller/promotionController");
const authenticateToken = require("../middleWare/auth"); // Assuming you have an authentication middleware

// Create a new promotion
router.post(
  "/",
  authenticateToken,
  promotionController.createPromotion
);

// Get all promotions
router.get(
  "/:id",
  authenticateToken,
  promotionController.getAllPromotions
);

// Update a promotion by UUID
router.patch(
  "/:id",
  authenticateToken,
  promotionController.updatePromotion
);

// Delete a promotion by UUID
router.delete(
  "/:id",
  authenticateToken,
  promotionController.deletePromotion
);

module.exports = router;
