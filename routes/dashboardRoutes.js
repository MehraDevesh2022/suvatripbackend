const express = require("express");
const router = express.Router();
const dashboardController = require("../controller/dashboardController");
const authenticateToken = require("../middleWare/auth");

router.get("/get-hotel-by-id", authenticateToken, dashboardController.getHotelById);

module.exports = router;
