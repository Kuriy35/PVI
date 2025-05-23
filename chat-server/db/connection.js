const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/ChatsDB");
    console.log("Connected to MongoDB using Mongoose");
  } catch (err) {
    console.error("Mongoose connection error:", err);
    throw err;
  }
}

module.exports = connectDB;
