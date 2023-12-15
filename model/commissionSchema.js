const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const commissionSchema = new mongoose.Schema({
  UUID: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  commission: {
    type: Number,
    required: true,
  }
});

const Commission = mongoose.model("Commission", commissionSchema);

module.exports = Commission;
