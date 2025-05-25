const Message = require("../models/message");
const Notification = require("../models/notification");
const ChatRoom = require("../models/chat-room");

module.exports = (io, onlineUsers) => {
  console.log("=== Socket.IO handler initialized ===");

  io.on("connection", (socket) => {
    socket.emit("connectionConfirmed", { socketId: socket.id });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    // Обробка підключення користувача
    socket.on("userConnected", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`👤 User ${userId} connected with socket ${socket.id}`);
      console.log("Online users:", Array.from(onlineUsers.entries()));
    });

    // Обробка відключення користувача
    socket.on("disconnect", () => {
      console.log(`🔌 Socket ${socket.id} disconnected`);
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`👤 User ${userId} removed from online users`);
          break;
        }
      }
      console.log("Remaining online users:", Array.from(onlineUsers.entries()));
    });

    // Функція надсилання повідомлень через Socket.IO
    // handler.js
    socket.on("sendMessage", async (messageData, callback) => {
      try {
        console.log("📨 Sending message via Socket.IO:", messageData);

        const { chatId, authorId, authorName, text } = JSON.parse(messageData);

        // Валідація
        if (!chatId) {
          return callback({
            success: false,
            error: "Chat id is required!",
          });
        }
        if (!authorId) {
          return callback({
            success: false,
            error: "Author id is required!",
          });
        }
        if (!authorName) {
          return callback({
            success: false,
            error: "Author name is required!",
          });
        }
        if (!text) {
          return callback({
            success: false,
            error: "Text content is required!",
          });
        }
        if (text.trim() === "") {
          return callback({
            success: false,
            error: "Message content can't be empty!",
          });
        }

        // Знаходимо чат спочатку
        const chat = await ChatRoom.findById(chatId);
        if (!chat) {
          return callback({
            success: false,
            error: "Chat not found",
          });
        }

        // Зберігаємо повідомлення в БД
        const message = new Message({ chatId, authorId, authorName, text });
        await message.save();

        const msg = await Message.findById(message._id).populate("chatId");
        console.log("✅ Message saved to DB:", msg.toObject());

        // Оновлюємо чат з останньою активністю та останнім повідомленням
        await ChatRoom.findByIdAndUpdate(
          chatId,
          {
            lastActivityAt: new Date(),
            lastMessage: msg._id,
          },
          { new: true }
        );
        console.log("✅ Chat room updated with last activity and message");

        // Створюємо нотифікацію для всіх учасників чату, крім автора
        const receivers = chat.users.filter(
          (userId) => userId.toString() !== authorId.toString()
        );
        const notification = new Notification({
          chat: chatId,
          unseenBy: receivers,
        });
        await notification.save();
        console.log("✅ Notification saved");

        // Відправляємо повідомлення всім онлайн учасникам чату
        let deliveredCount = 0;
        chat.users.forEach((userId) => {
          if (onlineUsers.has(userId.toString())) {
            const userSocketId = onlineUsers.get(userId.toString());
            console.log(
              `📤 Sending to user ${userId} with socket ${userSocketId}`
            );

            io.to(userSocketId).emit("messageReceived", {
              message: msg.toObject(),
            });

            deliveredCount++;
          } else {
            console.log(`❌ User ${userId} not online`);
          }
        });

        console.log(
          `✅ Message delivered to ${deliveredCount}/${chat.users.length} users`
        );

        // Повертаємо успіх автору
        callback({
          success: true,
          message: msg.toObject(),
          deliveredTo: deliveredCount,
          totalUsers: chat.users.length,
        });
      } catch (error) {
        console.error("❌ Error sending message via Socket.IO:", error);
        callback({
          success: false,
          error: error.message,
        });
      }
    });

    socket.on("getUserNotifications", async (userId, callback) => {
      try {
        const notifications = await Notification.find({
          unseenBy: parseInt(userId),
        }).populate({
          path: "chat",
          populate: {
            path: "lastMessage",
          },
        });
        if (!notifications) {
          return callback({
            success: false,
            error: "Notifications not found",
          });
        }

        callback({
          success: true,
          notifications: notifications,
        });
      } catch (error) {
        console.error("Failed to get user notifications:", error);
        callback({
          success: false,
          error: error.message,
        });
      }
    });

    socket.on("messagesViewed", async (chatId, userId, callback) => {
      console.log(`👁️ Messages viewed by ${userId} in chat ${chatId}`);

      try {
        await Notification.updateMany(
          { chat: chatId },
          { $pull: { unseenBy: userId } }
        );

        await Notification.deleteMany({
          chat: chatId,
          unseenBy: { $size: 0 },
        });

        console.log("✅ Notifications updated");

        callback({ success: true });
      } catch (error) {
        console.error("❌ Error updating notifications:", error);

        callback({ success: false, error: error.message });
      }
    });

    // Обробка додавання до нового чату
    socket.on("addedToChat", (chatData) => {
      console.log("👥 User added to chat:", chatData);
      chatData.users.forEach((userId) => {
        if (onlineUsers.has(userId.toString())) {
          const userSocketId = onlineUsers.get(userId);
          io.to(userSocketId).emit("newChat", chatData);
        }
      });
    });

    socket.on("getChatInfo", async (chatId, callback) => {
      try {
        if (!chatId) {
          return callback({
            success: false,
            error: "Chat id is required!",
          });
        }

        const chat = await ChatRoom.findById(chatId).populate("lastMessage");
        if (!chat) {
          return callback({
            success: false,
            error: "Chat not found",
          });
        }

        const participantsWithStatus = [];
        chat.users.forEach((currUserId) => {
          if (onlineUsers.has(currUserId.toString())) {
            participantsWithStatus.push({
              userId: currUserId,
              status: "Online",
            });
          } else {
            participantsWithStatus.push({
              userId: currUserId,
              status: "Offline",
            });
          }
        });

        callback({
          success: true, // Додано success: true
          chat: chat.toObject(),
          participantsWithStatus: participantsWithStatus,
        });
      } catch (error) {
        console.error("Failed to get chat information using Socket.IO:", error);
        callback({
          success: false,
          error: error.message,
        });
      }
    });

    socket.on("getChatsList", async (userId, callback) => {
      try {
        if (!userId) {
          return callback({
            success: false,
            error: "User id is required!",
          });
        }

        const chats = await ChatRoom.find({
          users: { $in: [userId] },
        })
          .populate("lastMessage")
          .sort({ lastActivityAt: -1 });

        callback({
          success: true,
          chats: chats,
        });
      } catch (error) {
        console.error("Failed to get chats list:", error);
        callback({
          success: false,
          error: error.message,
        });
      }
    });
  });

  console.log("=== Socket.IO handler setup completed ===");
};
