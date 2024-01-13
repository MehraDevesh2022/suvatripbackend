const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const facilitiesSchema = new mongoose.Schema({
    UUID: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true
    },
    name: { type: String, required: true }
});

const Facility = mongoose.model('Facility', facilitiesSchema);

module.exports = Facility;