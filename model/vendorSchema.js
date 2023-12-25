const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const vendorSchema = new mongoose.Schema({
  UUID: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  country: {
    type: String,
  },
  areaCode: {
    type: String,
  },
  city: {
    type: String,
  },
  contactNo : {
    type: String,
  },
  otp: {
    type: String,
    required: true,
  },
  otpVerify: {
    type: Boolean,
    default: false,
    required: true,
  },
  documents: {
    type: String,
  }
});

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
