const express = require("express");
const router = express.Router();
const {
  getChats,
  getChatById,
  createChat,
} = require("../controllers/chat-controller");

router.get("/user/:userId", getChats);
router.get("/:chatId", getChatById);
router.post("/", createChat);

module.exports = router;
