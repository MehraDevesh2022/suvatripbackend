const express = require("express");
const router = express.Router();
const hotelController = require("../controller/hotelController");
const authenticateToken = require("../middleWare/auth");

router.get("/get-all-hotels",
  authenticateToken,
  hotelController.getAllHotels);

router.post("/create-hotel",
  // authenticateToken,
  hotelController.createHotel);

router.get("/get-hotel-by-id/:id",
  authenticateToken,
  hotelController.getHotelById);
  
router.post("/update-hotel/:id",
  authenticateToken,
  hotelController.updateHotel);

router.delete("/delete-hotel/:id",
  authenticateToken,
  hotelController.deleteHotel);


module.exports = router;
