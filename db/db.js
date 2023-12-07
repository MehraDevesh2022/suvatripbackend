const mongoose = require("mongoose");
// add local db link here

const config  = require("../config/config");
function connectDB() {
  mongoose.set("strictQuery", false);

  mongoose
    .connect(config.DB_LINK)
    .then(function () {
      console.log("DB_connected");
    })
    .catch(function (err) {
      console.log("error", err);
    });
}

module.exports = connectDB;