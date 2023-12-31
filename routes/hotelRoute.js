const express = require("express");
const router = express.Router();
const hotelController = require("../controller/hotelController");
const authenticateToken = require("../middleWare/auth");

router.get("/get-all-hotels", authenticateToken, hotelController.getAllHotels);

router.get("/filter", authenticateToken, hotelController.filterHotels);

router.post("/create-hotel",hotelController.createHotel);

router.get(
  "/get-hotel-by-id/:id",
  // authenticateToken,
  hotelController.getHotelById
);

router.patch(
  "/update-hotel/:id",
  // authenticateToken,
  hotelController.updateHotel
);

router.delete(
  "/delete-hotel/:id",
  authenticateToken,
  hotelController.deleteHotel
);

module.exports = router;
