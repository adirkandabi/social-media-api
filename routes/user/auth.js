const express = require("express");
const validator = require("validator");
const router = express.Router();
const { hashPassword, generateRandomString } = require("../../utils");
const { type } = require("os");
router.post("/login", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error_msg: "the request should have a body",
      });
    }
    const { username = "", email = "", password = "" } = req.body;
    const missingFields = [];
    if (!email && !username) missingFields.push("email or username");
    if (!password) missingFields.push("password");
    if (missingFields.length > 0) {
      // IF 'MISSING FIELDS' ARRAY IS NOT EMPTY, RETURN ITS ELEMENTS AS A STRING
      return res.status(400).json({
        success: false,
        error_msg: "missing fields:" + missingFields.join(", "),
      });
    }
    const usersModel = req.app.locals.models.users;
    const identifier = email ? email : username;
    const idType = email ? "email" : "username";
    const user = await usersModel.findByUsername(identifier, idType);
    if (!user) {
      return res.status(401).json({
        success: false,
        error_msg: `invalid ${idType} or password`,
      });
    }
    const hashedPassword = hashPassword(password);
    if (user.password === hashedPassword) {
      // CLEAR FROM RESPONSE
      delete user.password;
      delete user._id;
      return res.status(200).json({ success: true, user: user });
    } else {
      return res.status(401).json({
        success: false,
        error_msg: `invalid ${idType} or password`,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error_msg: "server error" });
  }
});
router.post("/register", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error_msg: "the request should have a body",
      });
    }
    const {
      email = "",
      username = "",
      password = "",
      first_name = "",
      last_name = "",
      phone = "",
      birthday = "",
    } = req.body;
    const missingFields = [];
    // IF THERE IS ANY MISSING FIELDS, ADD IT TO THE ARRAY
    if (!email) missingFields.push("email");
    if (!username) missingFields.push("username");
    if (!password) missingFields.push("password");
    if (!first_name) missingFields.push("first_name");
    if (!last_name) missingFields.push("last_name");
    if (!phone) missingFields.push("phone");
    if (!birthday) missingFields.push("birthday");

    if (missingFields.length > 0) {
      // IF 'MISSING FIELDS' ARRAY IS NOT EMPTY, RETURN ITS ELEMENTS AS A STRING
      return res.status(400).json({
        success: false,
        error_msg: "missing fields:" + missingFields.join(", "),
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        error_msg: "invalid email address",
      });
    }
    if (!validator.isMobilePhone(phone, "he-IL")) {
      return res.status(400).json({
        success: false,
        error_msg: "invalid phone number",
      });
    }
    // GET THE USERS COLLECTION INSTANCE WE STORED IN 'APP.JS'
    const usersModel = req.app.locals.models.users;
    // CHECK IF THERE IS AN EXIST USER WITH THE SAME EMAIL OR PHONE
    const user = await usersModel.isUserExist(email, phone, username);
    if (user && user.email === email) {
      return res
        .status(409)
        .json({ success: false, error_msg: "This email is already in use" });
    } else if (user && user.phone === phone) {
      return res.status(409).json({
        success: false,
        error_msg: "This phone number is already in use",
      });
    } else if (user && user.username === username) {
      return res.status(409).json({
        success: false,
        error_msg: "This username is already in use",
      });
    }
    const isOlderThan18 = validateAge(birthday);
    if (isOlderThan18 === null) {
      return res.status(400).json({
        success: false,
        error_msg: "birthday format must be in YYYY-MM-DD",
      });
    }
    if (!isOlderThan18) {
      return res.status(400).json({
        success: false,
        error_msg: "user must be older than 18",
      });
    }
    const user_id = generateRandomString();

    const userData = { user_id, ...req.body };
    userData["password"] = hashPassword(userData["password"]);
    const result = await usersModel.create(userData);
    if (result.insertedCount) {
      return res.status(200).json({ success: true });
    } else {
      return res
        .status(500)
        .json({ success: false, error_msg: "problem with saving the data" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error_msg: "server error" });
  }
});

function validateAge(birthday) {
  // FUNCTION TO CHECK IF THE USER IS OLDER THAN 18
  try {
    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) {
      console.log("Invalid date");
    }

    const today = new Date();

    const ageDiff = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (
      ageDiff > 18 ||
      (ageDiff === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
    ) {
      return true;
    }

    return false;
  } catch (err) {
    console.log(err);
    return null;
  }
}

module.exports = router;
