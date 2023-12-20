const jwt = require("jsonwebtoken");
const config = require("../config/config");

const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authorizationHeader = req.headers.authorization;
  console.log("authorizationHeader", authorizationHeader);
  if (!authorizationHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extract the token from the "Bearer" format
  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
  
    req.user = user;

    next();
  });
};

module.exports = authenticateToken;
