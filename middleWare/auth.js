const jwt = require("jsonwebtoken");
const config = require("../config/config");


const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const hotelSecret = req.headers.my_secret;

  if (hotelSecret === config.MY_SECRET) {
    req.isHotelAccess = true;
    next();
    return;

  }


  // Check if the user is logged in with a valid token
  if (authorizationHeader) {
    const token = authorizationHeader.split(" ")[1];
    //  console.log(token, "token");
    if (token) {
      jwt.verify(token, config.JWT_SECRET, (err, user) => {
        if (err) {
          // console.log(err, "err");
          return res.status(403).json({ message: "Forbidden" });
        }
      console.log(user, "user");
        req.user = user;
        next();
      });

      return; // Exit the middleware if the user is logged in
    }
  }

};

module.exports = authenticateToken;
