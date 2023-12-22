const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
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
    unique: true,
  },
  phoneNumber: {
    type: Number,
    unique: true,
  },
  otp: {
    type: String,
    // required: true,
  },
  otpVerify: {
    type: Boolean,
    default: false,
  }
});

userSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model("User", userSchema);

module.exports = User;
