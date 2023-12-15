const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const ticketSchema = new mongoose.Schema({
  UUID: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  user_id:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  vendor_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  messages: {
    type: Array,
    required: true,
  }
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;