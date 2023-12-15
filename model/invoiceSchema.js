const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const invoiceSchema = new mongoose.Schema({
  UUID: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  booking_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  invoice_url: {
    type: String,
    required: true,
  },
  payment_status: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },

});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
