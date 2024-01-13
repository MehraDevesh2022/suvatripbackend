const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ammenitiesSchema = new mongoose.Schema({
    UUID: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true
    },
    name: { type: String, required: true }
});

const Ammenity = mongoose.model('Ammenity', ammenitiesSchema);

module.exports = Ammenity;