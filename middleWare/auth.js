const jwt = require("jsonwebtoken");
const config = require("../config/config");

const authenticateToken = (req, res, next) => {
  console.log(req.headers, "req.headers");

  const authorizationHeader = req.headers.authorization;
  const hotelSecret = req.headers.my_secret;

  if (hotelSecret === config.MY_SECRET) {
    req.isHotelAccess = true;
    next();
    return;
  }

  if (authorizationHeader) {
    const token = authorizationHeader.split(" ")[1];
    //  console.log(token, "token");
    if (token) {
      jwt.verify(token, config.JWT_SECRET, (err, user) => {
        if (err) {
          console.log(err, "err");
          return res.status(403).json({ message: "Forbidden" });
        }
        console.log(user, "user");
        req.user = user;
        next();
      });

      return;
    }
  }
  res.status(401).json({ message: "Unauthorized" });
};

module.exports = authenticateToken;
