const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema({
  UUID: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  hotel_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
  room_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  user_id:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  invoice_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
  promotion_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Promotion" },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  estimatedArival: {
    type: String,
    required: true,
  },
  specialRequest: {
    type: String,
  },
  roomNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  }
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
