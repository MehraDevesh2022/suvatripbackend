const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const reviewSchema = new mongoose.Schema({
  UUID: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  staff_rating: {
    type: Number, // Changed to Number
    required: true
  },
  facilities_rating: {
    type: Number, // Changed to Number
    required: true
  },
  cleanliness_rating: {
    type: Number, // Changed to Number
    required: true
  },
  comfort_rating: {
    type: Number, // Changed to Number
    required: true
  },
  money_rating: {
    type: Number, // Changed to Number
    required: true
  },
  location_rating: {
    type: Number, // Changed to Number
    required: true
  },
  wifi_rating: {
    type: Number, // Changed to Number
    required: true
  },
  review: {
    type: String,
    required: true
  },
  images: [
    {
      type: String // image url
    }
  ],
  created_at: {
    type: Date,
    default: () => {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      return twoMonthsAgo;
    },
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
