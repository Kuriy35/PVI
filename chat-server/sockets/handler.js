const Message = require("../models/message");
const Notification = require("../models/notification");
const ChatRoom = require("../models/chat-room");

module.exports = (io, onlineUsers) => {
  console.log("=== Socket.IO handler initialized ===");

  io.on("connection", (socket) => {
    socket.emit("connectionConfirmed", { socketId: socket.id });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    socket.on("userConnected", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
      console.log("Online users:", Array.from(onlineUsers.entries()));
    });

    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} removed from online users`);
          break;
        }
      }
      console.log("Remaining online users:", Array.from(onlineUsers.entries()));
    });

    socket.on("sendMessage", async (messageData, callback) => {
      try {
        const { chatId, authorId, authorName, text } = JSON.parse(messageData);

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

        const chat = await ChatRoom.findById(chatId);
        if (!chat) {
          return callback({
            success: false,
            error: "Chat not found",
          });
        }

        const message = new Message({ chatId, authorId, authorName, text });
        await message.save();

        const msg = await Message.findById(message._id).populate("chatId");

        await ChatRoom.findByIdAndUpdate(
          chatId,
          {
            lastActivityAt: new Date(),
            lastMessage: msg._id,
          },
          { new: true }
        );

        const receivers = chat.users.filter(
          (userId) => userId.toString() !== authorId.toString()
        );
        const notification = new Notification({
          chat: chatId,
          unseenBy: receivers,
        });
        await notification.save();

        let deliveredCount = 0;
        chat.users.forEach((userId) => {
          if (onlineUsers.has(userId.toString())) {
            const userSocketId = onlineUsers.get(userId.toString());

            io.to(userSocketId).emit("messageReceived", {
              message: msg.toObject(),
            });

            deliveredCount++;
          }
        });

        callback({
          success: true,
          message: msg.toObject(),
          deliveredTo: deliveredCount,
          totalUsers: chat.users.length,
        });
      } catch (error) {
        console.error("Error sending message via Socket.IO:", error);
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
      try {
        await Notification.updateMany(
          { chat: chatId },
          { $pull: { unseenBy: userId } }
        );

        await Notification.deleteMany({
          chat: chatId,
          unseenBy: { $size: 0 },
        });

        callback({ success: true });
      } catch (error) {
        console.error("Error updating notifications:", error);

        callback({ success: false, error: error.message });
      }
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
          success: true,
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

    socket.on(
      "createChat",
      async (creatorId, name, description, users, callback) => {
        try {
          if (!name) {
            return callback({
              success: false,
              error: "Chat name is required!",
            });
          }

          if (!Array.isArray(users) || users.length < 2) {
            return callback({
              success: false,
              error: "Users is required!",
            });
          }

          const chat = new ChatRoom({ name, description, users });
          await chat.save();

          if (!chat) {
            return callback({
              success: false,
              error: "Failed to create chat",
            });
          }

          const receivers = chat.users.filter(
            (userId) => userId.toString() !== creatorId.toString()
          );

          const notification = new Notification({
            chat: chat._id,
            unseenBy: receivers,
          });
          await notification.save();

          users.forEach((userId) => {
            if (onlineUsers.has(userId.toString())) {
              const userSocketId = onlineUsers.get(userId.toString());

              io.to(userSocketId).emit("addedToNewChat");
            }
          });

          callback({
            success: true,
            chat: chat.toObject(),
          });
        } catch (error) {
          console.error("Failed to create chat using Socket.IO:", error);
          callback({
            success: false,
            error: error.message,
          });
        }
      }
    );

    socket.on("addUsersToChat", async (chatId, newUsers, callback) => {
      try {
        if (!chatId) {
          return callback({
            success: false,
            error: "Chat ID is required!",
          });
        }

        if (!Array.isArray(newUsers) || newUsers.length === 0) {
          return callback({
            success: false,
            error: "At least one user must be added!",
          });
        }

        const chat = await ChatRoom.findById(chatId);
        if (!chat) {
          return callback({
            success: false,
            error: "Chat not found!",
          });
        }

        const existingUserIds = new Set(chat.users.map((u) => u.toString()));
        const usersToAdd = newUsers.filter(
          (userId) => !existingUserIds.has(userId.toString())
        );

        if (usersToAdd.length === 0) {
          return callback({
            success: false,
            error: "All selected users are already in the chat!",
          });
        }

        chat.users.push(...usersToAdd);
        await chat.save();

        const notification = new Notification({
          chat: chatId,
          unseenBy: newUsers,
        });
        await notification.save();

        usersToAdd.forEach((userId) => {
          if (onlineUsers.has(userId.toString())) {
            const userSocketId = onlineUsers.get(userId.toString());
            io.to(userSocketId).emit("addedToNewChat", chat.toObject());
          }
        });

        callback({
          success: true,
          chat: chat.toObject(),
        });
      } catch (error) {
        console.error("Failed to add users to chat using Socket.IO:", error);
        callback({
          success: false,
          error: error.message,
        });
      }
    });
  });

  console.log("=== Socket.IO handler setup completed ===");
};
