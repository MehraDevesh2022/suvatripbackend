const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  UUID: {
    type: String,
    unique: true,
  },
  admin_id: {
    type: String,
    required: true,
  },
  propertyName: {
    type: String,
  },
  contactNo: {
    type: String,
  },
  country:{
    type:String,
  },
  city:{
    type:String,
  },
  address:{
    type:String,
  },
  type:{
    type:String
  },
  hotelRules:{
    type:String
  },
  parking:{
    type:String
  },
  documents:{
    type:String
  }


});

const admin = mongoose.model("admin", adminSchema);

module.exports = admin;