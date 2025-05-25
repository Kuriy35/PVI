const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./db/connection");
const chatRoutes = require("./routes/chat-routes");
const messageRoutes = require("./routes/message-routes");
const notificationRoutes = require("./routes/notification-routes");
const socketHandler = require("./sockets/handler");

const onlineUsers = new Map();

const PORT = 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Або ваш клієнтський URL
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  req.io = io; // Додаємо io до об'єкта запиту
  next();
});

// Socket.io
socketHandler(io, onlineUsers);

// Routes
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// MongoDB + запуск сервера
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Server running on http://localhost:3000");
  });
});
