const jwt = require("jsonwebtoken");
const  config  = require("../config/config");
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
   console.log(token , "token");
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;

    next();
  });
};

module.exports = authenticateToken;
