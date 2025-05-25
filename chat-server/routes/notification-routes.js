const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");

// Отримання сповіщень для користувача
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({
      unseenBy: parseInt(userId),
    })
      .populate("chatId")
      .populate("messageId");

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to get notifications" });
  }
});

// Позначення сповіщення як прочитаного
router.post("/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    await Notification.updateOne(
      { _id: notificationId },
      { $pull: { unseenBy: userId } }
    );

    // Видаляємо сповіщення, якщо unseenBy пустий
    await Notification.deleteOne({
      _id: notificationId,
      unseenBy: { $size: 0 },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

module.exports = router;
