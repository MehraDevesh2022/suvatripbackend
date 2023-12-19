// models/Hotel.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const hotelSchema = new mongoose.Schema({
    UUID: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true
    },
    vendor_id: { type: String },
    propertyName: { type: String, required: true },
    propertyType: { type: String, required: true },
    rating: { type: String },
    currency: { type: String, required: true },
    contactNo: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    roomsNo: { type: Number, required: true },
    propertyPicture: { type: Array, required: true },
    roomPicture: { type: Array, required: true },
    areaPicture: { type: Array, required: true },
    facilities: { type: Object, required: true },
    ammenities: { type: Object, required: true },
    hotelRules: { type: Object, required: true },
    paymentPolicy: { type: Object, required: true },
    parking: { type: Object, required: true },
    transportation: { type: Object, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    promoted: { type: Boolean }
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;