require("dotenv").config();
const connectToDatabase = require("./models/db.js");
const Models = require("./models/Models.js");
const express = require("express");
const routes = require("./routes/index.js");
const app = express();
const models = new Models();

async function startServer() {
  try {
    const dbInstance = await connectToDatabase();
    await models.init(dbInstance);
    // STORE ALL COLLECTION INSTANCE TO USE LATER IN THE ROUTES
    app.locals.models = models;
    // Middleware to parse incoming requests with JSON payloads
    app.use(express.json());

    // Use routes for API endpoint
    app.use("/", routes);

    // Server listening on specified port
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (ex) {
    console.log(ex);
  }
}
startServer();
