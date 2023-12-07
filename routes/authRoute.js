const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const authenticateToken = require("../middleWare/auth");


router.post("/signup/user", authController.signupUser);
router.post("/signup/vendor", authController.signupVendor);
router.post("/signup/admin", authController.signupAdmin);
router.post("/login", authController.loginUser);
router.get("/profile", authenticateToken, (req, res) => {
  // Access user profile using req.user
  res.status(200).json({ user: req.user });
});

module.exports = router;
