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
    hotel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    roomType: { type: String, required: true },
    guests: { type: String, required: true },
    singleBed: { type: Number, required: true },
    doubleBed: { type: Number, required: true },
    kingBed: { type: Number, required: true },
    superKingBed: { type: Number, required: true },
    totalBeds: { type: Number, required: true },
    bathroom: { type: String, required: true },
    weekdayPrice: { type: String, required: true },
    weekendPrice: { type: String, required: true },
    nonRefundPrice: { type: String, required: true },
    noOfRooms: { type: String, required: true },
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;