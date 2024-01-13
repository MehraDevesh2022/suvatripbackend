const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/dashboardController");
const authenticateToken = require("../middleWare/auth");

router.get("/get-hotels", authenticateToken, dashboardController.getAllHotels);

router.get("/get-hotel-by-id", authenticateToken, dashboardController.getHotelById);

router.get("/get-hotel-by-vendor-id/:id", authenticateToken, dashboardController.getHotelByVendorId);

router.patch("/approve-hotel/:id", authenticateToken, dashboardController.approveHotel);

router.get("/facilities", authenticateToken, dashboardController.getAllFacilities);

router.patch("/facilities/:id", authenticateToken, dashboardController.updateFacilities);

router.post("/facilities", authenticateToken, dashboardController.addFacilities);

router.delete("/facilities/:id", authenticateToken, dashboardController.deleteFacilities);

router.get("/ammenities", authenticateToken, dashboardController.getAllAmmenities);

router.patch("/ammenities/:id", authenticateToken, dashboardController.updateAmmenities);

router.post("/ammenities", authenticateToken, dashboardController.addAmmenities);

router.delete("/ammenities/:id", authenticateToken, dashboardController.deleteAmmenities);

module.exports = router;
