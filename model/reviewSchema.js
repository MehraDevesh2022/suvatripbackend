const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const reviewSchema = new mongoose.Schema({
  UUID: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  hotel_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
  user_id:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: {
    type: Number,
    required: true,
  },
  review: {
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
