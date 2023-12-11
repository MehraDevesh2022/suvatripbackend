const express = require("express");
const router = express.Router();
const ratePlanController = require("../controller/rateController");
const authenticateToken = require("../middleware/auth"); // Assuming you have an authentication middleware

// Create a new rate plan admin
router.post(
  "/rate-plans",
  authenticateToken,
  ratePlanController.createRatePlan
);

// Get all rate plans
router.get(
  "/rate-plans",
  ratePlanController.getAllRatePlans
);

// Get a specific rate plan by ID
router.get(
  "/rate-plans/:id",
  authenticateToken,
  ratePlanController.getRatePlanById
);

// Update a rate plan by ID
router.patch(
  "/rate-plans/:id",
  authenticateToken,
  ratePlanController.updateRatePlan
);

// Delete a rate plan by ID
router.delete(
  "/rate-plans/:id",
  authenticateToken,
  ratePlanController.deleteRatePlan
);

module.exports = router;
