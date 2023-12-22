const mongoose = require("mongoose");

const googleAuthSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    // You can add more fields here if needed
});

const GoogleAuth = mongoose.model('GoogleAuth', googleAuthSchema);

module.exports = GoogleAuth;

