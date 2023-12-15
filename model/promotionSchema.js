const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const promotionSchema = new mongoose.Schema({
  UUID: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  promotionName: {
    type: String,
    required: true,
  },
  room_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  endDate: {
    type: Date,
    required: true,
  },
  totalReservations: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },
});

const Promotion = mongoose.model("Promotion", promotionSchema);

module.exports = Promotion;
