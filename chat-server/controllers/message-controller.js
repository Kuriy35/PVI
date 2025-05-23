const Message = require("../models/message.js");
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
const sendMessageToChat = async (req, res) => {
  try {
    const { chatId, authorId, authorName, text } = req.body;
    if (!chatId) {
      return res.status(400).json({ error: "Chat id is required!" });
    }
    if (!authorId) {
      return res.status(400).json({ error: "Author id is required!" });
    }
    if (!authorName) {
      return res.status(400).json({ error: "Author name is required!" });
    }
    if (!text) {
      return res.status(400).json({ error: "Text content is required!" });
    }

    if (text === "") {
      return res.status(400).json({ error: "Message content can`t be empty!" });
    }

    const msg = new Message({ chatId, authorId, authorName, text });
    msg.save();
    res.status(201).json(msg);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Failed to send message to this chat! (${error})` });
  }
};

module.exports = { getMessagesForChat, sendMessageToChat };
