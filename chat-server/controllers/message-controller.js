const Message = require("../models/message.js");
const ChatRoom = require("../models/chat-room.js");
const mongoose = require("mongoose");

const getMessagesForChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const objectChatId = new mongoose.Types.ObjectId(chatId);
    const messages = await Message.find({ chatId: objectChatId });

    res.status(200).json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Failed to get messages for this chat! (${error})` });
  }
};

module.exports = { getMessagesForChat };
