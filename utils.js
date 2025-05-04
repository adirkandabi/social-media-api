const crypto = require("crypto");
require("dotenv").config();

function hashPassword(password) {
  return crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(password)
    .digest("hex");
}

function generateRandomString(length = 10) {
  // GENERATE RANDOM STRING FOR UNIQUE USER ID
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
module.exports = { hashPassword, generateRandomString };
