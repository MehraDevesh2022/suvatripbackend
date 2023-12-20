const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const authenticateToken = require("../middleWare/auth");


router.post("/signup/user", authController.signupUser);
router.post("/signup/vendor", authController.signupVendor);
router.post("/signup/admin", authController.signupAdmin);
router.post("/login", authController.loginUser);
router.post("/loginviamobile", authController.loginviamobile);
router.get("/profile", authenticateToken, (req, res) => {
  
  res.status(200).json({ user: req.user , succsess: true });
});

module.exports = router;
