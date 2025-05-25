const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    unseenBy: { type: [Number], required: true },
  },
  { collection: "Notifications" }
);

module.exports = mongoose.model("Notification", NotificationSchema);
