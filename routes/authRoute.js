const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const authenticateToken = require("../middleWare/auth");


router.post("/signup/user", authController.signupUser);
router.post("/signup/google", authController.signupGoogle);
router.post("/signup/fb", authController.signUpFacebookAuth);
router.post("/signup/vendor", authController.signupVendor);
router.post("/vendor-edit", authenticateToken, authController.editVendor);
router.post("/vendor-otp", authController.vendorOtp);
router.post("/user-otp", authController.userOtp);
router.post("/signup/admin", authController.signupAdmin);
router.post("/login", authController.loginUser);
router.post("/loginviamobile", authController.loginviamobile);
router.post('/update-password', authenticateToken , authController.updatePassword);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.changePassword);
router.post("/signup/user-phone", authController.SignupViaPhone);
router.get("/profile", authenticateToken, authController.profile);
router.post("/user-phone-otp", authController.userPhoneOtp);
router.get("/vendor-profile", authenticateToken, authController.vendorProfile);


module.exports = router;
