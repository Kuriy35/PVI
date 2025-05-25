const ChatRoom = require("../models/chat-room");
const mongoose = require("mongoose");

const createChat = async (req, res) => {
  try {
    const { name, description, users } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Chat name is required!" });
    }

    if (!Array.isArray(users) || users.length < 2) {
      return res
        .status(400)
        .json({ error: "Chat must contain at least 2 users!" });
    }

    const chat = new ChatRoom({ name, description, users });
    await chat.save();

    req.io.emit("addedToChat", chat);

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: `Failed to create room! (${err})` });
  }
};

const getChats = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await ChatRoom.find({ users: parseInt(userId) });

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to get chats list!" });
  }
};

const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await ChatRoom.findById(chatId);
    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ error: "Failed to get chat!" });
  }
};

module.exports = { createChat, getChats, getChatById };
