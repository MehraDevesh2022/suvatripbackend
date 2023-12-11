const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review_id: {
    type: String,
    required: true,
    unique: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  hotel_id: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  review_text: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },

});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
