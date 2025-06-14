const express = require("express");
const router = express.Router();
const { getMessagesForChat } = require("../controllers/message-controller.js");

router.get("/chat/:chatId", getMessagesForChat);
// router.post("/", sendMessageToChat);

module.exports = router;
