const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require("mongoose");
let dbInstance = null; // Singleton instance for database connection

async function connectToDatabase() {
  // Return existing connection if already established
  if (dbInstance) return dbInstance;

  const uri = process.env.DB_CONNECTION_STRING;
  if (!uri) {
    throw new Error("MongoDB URI is not defined");
  }

  // Create a new MongoDB client with recommended settings
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    useUnifiedTopology: true,
  });

  try {
    console.log("attempt to connect");

    await client.connect(); // Establish the database connection
    console.log("get the instance");

    dbInstance = client.db(); // Store the database instance
    console.log("connected to DB");

    return dbInstance;
  } catch (err) {
    throw err;
  }
}

module.exports = connectToDatabase;
