const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  type: { type: String, enum: ["join", "leave", "message"], required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
