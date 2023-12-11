const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  UUID: {
    type: String,
    required: true,
    unique: true,
  },
  booking_id: {
    type: String,
    required: true,
  },
  invoice_url: {
    type: String,
    required: true,
  },
  payment_status: {
    type: String,
    enum: ["Pending", "Paid", "Failed"], //steps to be added 
    default: "Pending",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
 
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
