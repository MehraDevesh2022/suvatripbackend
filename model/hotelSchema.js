// models/Hotel.js
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    UUID: { type: String, required: true },
    vendor_id: { type: String, required: true },
    propertyName: { type: String, required: true },
    contactNo: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    propertyType: { type: String, required: true },
    roomsNo: { type: Number, required: true },
    currency: { type: String, required: true },
    photos: { type: [String], required: true },
    facilities: { type: [String], required: true },
    hotelRules: { type: String, required: true },
    paymentPolicy: { type: String, required: true },
    parking: { type: Boolean, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    promoted: { type: Boolean, required: true }
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;