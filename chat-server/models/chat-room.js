const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    users: { type: [Number], required: true },
    createdAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { collection: "Chat_rooms" }
);

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);
