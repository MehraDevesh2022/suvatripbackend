const jwt = require("jsonwebtoken");
const config = require("../config/config");


const authHotel= (req, res, next) => {
  
    const hotelSecret = req.headers.my_secret;

  if (hotelSecret === config.MY_SECRET) {
    req.isHotelAccess = true;
    next();
    return;
  }else{
    return res.status(403).json({ message: "Forbidden" });
  }
};

module.exports = authHotel;
