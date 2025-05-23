const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    users: { type: [Number], required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "Chat_rooms" }
);

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);
