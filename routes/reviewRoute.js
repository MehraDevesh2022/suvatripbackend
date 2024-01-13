const express = require("express");
const router = express.Router();
const reviewController = require("../controller/reviewController");
const authenticateToken = require("../middleWare/auth"); 

// Create a new review
router.post("/", reviewController.createReview);

// Get all reviews
router.get("/:id", reviewController.getAllReviews);

// Get a specific review by review_id
// router.get("/reviews/:id", authenticateToken, reviewController.getReviewById);

// Update a review by review_id
router.post("/reviews/:id", reviewController.updateReview);

// Delete a review by review_id
router.delete("/delete/:id", authenticateToken, reviewController.deleteReview);

module.exports = router;
