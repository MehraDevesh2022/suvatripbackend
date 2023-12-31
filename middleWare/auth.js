const jwt = require("jsonwebtoken");
const config = require("../config/config");


const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authorizationHeader = req.headers.authorization;

  console.log(req.headers.authorization);

  // Check if the user is logged in with a valid token
  if (authorizationHeader) {
    const token = authorizationHeader.split(" ")[1];

    if (token) {
      jwt.verify(token, config.JWT_SECRET, (err, user) => {
        if (err) {
          console.log(err, "err");
          return res.status(403).json({ message: "Forbidden" });
        }

        req.user = user;
        next();
      });

      return; // Exit the middleware if the user is logged in
    }
  }

  const hotelSecret = req.headers.my_secret;

  if (hotelSecret === config.MY_SECRET) {
    req.isHotelAccess = true;
    next();
    return;
  }
};

module.exports = authenticateToken;
