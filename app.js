require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectToDatabase = require("./models/db.js");
const Models = require("./models/Models.js");
const routes = require("./routes/index.js");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Update if deployed
    methods: ["GET", "POST"],
  },
});

const models = new Models();

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_room", (room) => socket.join(room));
  socket.on("leave_room", (room) => socket.leave(room));

  socket.on("send_message", async (data) => {
    const { sender, receiver, room, text } = data;
    const timestamp = new Date();

    // Save to DB
    await models.message.save({ sender, receiver, text, room, timestamp });

    // Broadcast to the room
    io.to(room).emit("receive_message", {
      sender,
      text,
      room,
      timestamp,
    });

    // Emit updated unread count to receiver
    const unread = await models.message.countUnread(receiver);
    io.to(receiver).emit("unread_count", unread);
  });

  socket.on("mark_as_read", async ({ room, receiver }) => {
    await models.message.markAsRead(room, receiver);
  });

  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

// Main startup function
async function startServer() {
  try {
    const dbInstance = await connectToDatabase();
    await models.init(dbInstance);

    app.locals.models = models;

    app.use(cors());
    app.use(express.json());

    // General routes
    app.use("/", routes);

    // Custom friend route
    // app.use("/friends", require("./routes/user/friends"));

    // Messages route
    app.use("/messages", require("./routes/chat/messages"));
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
}

startServer();
