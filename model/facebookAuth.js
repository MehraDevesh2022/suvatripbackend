const mongoose = require('mongoose');

let FacebookSchema = new mongoose.Schema({
    name: {
        type: String,
      },
      email: {
        type: String
      },
      hashedPassword: {
        type: String,
      },
      facebookId: {
        type: String
      }
    }, {
      timestamps: true
    });
    
const FacebookAuth = mongoose.model("FacebookAuth", FacebookSchema);

module.exports = FacebookAuth;
