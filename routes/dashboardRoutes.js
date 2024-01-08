const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/dashboardController");
const authenticateToken = require("../middleWare/auth");

router.get("/get-hotels", authenticateToken, dashboardController.getAllHotels);

router.get("/get-hotel-by-id", authenticateToken, dashboardController.getHotelById);

router.get("/get-hotel-by-vendor-id/:id", authenticateToken, dashboardController.getHotelByVendorId);

router.patch("/approve-hotel/:id", authenticateToken, dashboardController.approveHotel);

module.exports = router;
