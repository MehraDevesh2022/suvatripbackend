const express = require("express");
const router = express.Router();
const roomController = require("../controller/roomController");
const authenticateToken = require("../middleWare/auth"); // Assuming you have an authentication middleware

router.post(
  "/",
  // authenticateToken,
  roomController.createRoom
);

// get all rooms

 router.get("/get-all-rooms" , authenticateToken ,  roomController.getAllRooms)

router.get(
  "/:id",
  // authenticateToken,
  roomController.getRoomDetails
);

router.patch(
  "/:id",
  // authenticateToken,
  roomController.updateRoom
);

router.delete(
  "/:id",
  // authenticateToken,
  roomController.deleteRoom
);

module.exports = router;
