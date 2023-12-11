const mongoose = require("mongoose");

const ratePlanSchema = new mongoose.Schema({
  hotel_id: {
    type: String,
    required: true,
  },
  planName: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  policy: {
    type: String,
    required: true,
  },
  // Add any additional fields as needed
});

const RatePlan = mongoose.model("RatePlan", ratePlanSchema);

module.exports = RatePlan;
