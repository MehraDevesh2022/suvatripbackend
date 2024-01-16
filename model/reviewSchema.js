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
 
  // add booking ref
  booking_id: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  staff_rating: {
    type: Number,  
    required: true
  },
  facilities_rating: {
    type: Number,
    required: true
  },
  cleanliness_rating: {
    type: Number, 
    required: true
  },
  comfort_rating: {
    type: Number, 
    required: true
  },
  money_rating: {
    type: Number, 
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
  highlight: {
    type: String,
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

  username : {
    type: String, 
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

reviewSchema.pre('save', function (next) {
  this.staff_rating *= 2;
  this.facilities_rating *= 2;
  this.cleanliness_rating *= 2;
  this.comfort_rating *= 2;
  this.money_rating *= 2;
  this.location_rating *= 2;
  this.wifi_rating *= 2;

  
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
