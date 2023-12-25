const express = require("express");
const router = express.Router();
const inboxController = require("../controller/inboxController");
const authenticateToken = require("../middleWare/auth"); // Assuming you have an authentication middleware

router.post(
  "/",
  authenticateToken,
  inboxController.sendMessage
);

router.get(
  "/:id",
  // authenticateToken,
  inboxController.getMessages
);

router.get(
  "/get-by-id/:chatId",
  // authenticateToken,
  inboxController.getMessagesById
);

module.exports = router;
