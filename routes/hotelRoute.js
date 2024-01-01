const express = require("express");
const router = express.Router();
const hotelController = require("../controller/hotelController");
const authenticateToken = require("../middleWare/auth");

router.get("/get-all-hotels", authenticateToken, hotelController.getAllHotels);

router.get("/filter", authenticateToken, hotelController.filterHotels);

router.post("/create-hotel",authenticateToken , hotelController.createHotel);
<<<<<<< HEAD

router.get("/get-hotel-by-id/:id",
  authenticateToken,
=======
router.get("/get-hotel-by-id/:id",
  // authenticateToken,
>>>>>>> 6678a86420d9f93d81e53c251b045d9944ff0ab9
  hotelController.getHotelById);

router.patch(
  "/update-hotel/:id",
  authenticateToken,
  hotelController.updateHotel
);

router.delete(
  "/delete-hotel/:id",
  authenticateToken,
  hotelController.deleteHotel
);

module.exports = router;
