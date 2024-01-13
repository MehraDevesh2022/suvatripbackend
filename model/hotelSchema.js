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
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    rooms: { type: Array, required: true },
    propertyName: { type: String, required: true },
    propertyType: { type: String, required: true },
    rating: { type: String, default: "4" },
    currency: { type: String, required: true },
    contactNo: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    zipCode: { type: String, },
    state: { type: String,  },
    roomsNo: { type: Number, required: true },
    propertyPicture: { type: Array, required: true },
    roomPicture: { type: Array, required: true },
    areaPicture: { type: Array, required: true },
    facilities: { type: Array, required: true },
    ammenities: { type: Array, required: true },
    hotelRules: { type: Object, required: true },
    paymentPolicy: { type: Object, required: true },
    parking: { type: Object, required: true },
    transportation: { type: Object, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    promoted: { type: Boolean },
    description: { type: String, required: true },
    taxFile: { type: Array, required: true },
    propertyFile: { type: Array, required: true },
    isVerified: { type: Boolean, required: true, default: false }
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;