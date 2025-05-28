require("dotenv").config();
const connectToDatabase = require("./models/db.js");
const Models = require("./models/Models.js");
const express = require("express");
const routes = require("./routes/index.js");
const core = require("mongodb/lib/core/index.js");
const cors = require("cors");
// FOR SOCKET.IO
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
const models = new Models();

async function startServer() {
  try {
    const dbInstance = await connectToDatabase();
    await models.init(dbInstance);
    // STORE ALL COLLECTION INSTANCE TO USE LATER IN THE ROUTES
    app.locals.models = models;
    // Middleware to parse incoming requests with JSON payloads
    app.use(express.json());
    app.use(cors());
    // Use routes for API endpoint
    app.use("/", routes);
    // Socket.IO connection
    // io.on("connection", (socket) => {
    //   console.log("User connected:", socket.id);

    //   socket.on("send_message", (data) => {
    //     console.log("Received message:", data);
    //     socket.broadcast.emit("receive_message", data);
    //   });

    //   socket.on("disconnect", () => {
    //     console.log("User disconnected:", socket.id);
    //   });
    // });
    // Server listening on specified port
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (ex) {
    console.log(ex);
  }
}
startServer();
