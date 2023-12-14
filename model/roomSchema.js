// models/Hotel.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const roomSchema = new mongoose.Schema({
    UUID: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true
    },
    hotel_id: { type: String, required: true },
    roomType: { type: String, required: true },
    guests: { type: Number, required: true },
    beds: { type: Number, required: true },
    bathroom: { type: Number, required: true },
    price: { type: Number, required: true },
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;