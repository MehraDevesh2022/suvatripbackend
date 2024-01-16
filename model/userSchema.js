const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
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
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  phoneOtp: {
    type: String,
    required: true,
  },
  phoneOtpVerify: {
    type: Boolean,
    default: false,
    required: true
  },
  otpVerify: {
    type: Boolean,
    default: false,
    required: true
  },
  authType: {
    type: String,
    required: true,
  },
});

// Add a conditional field based on authType
userSchema.add({
  facebookId: {
    type: String,
    unique: true,
    required: function() {
      return this.authType === 'facebook';
    },
    default: uuidv4, 
  },
});





userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
userSchema.index({ facebookId: 1 }, { unique: false });
userSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model("User", userSchema);

module.exports = User;
