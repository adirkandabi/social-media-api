const validator = require("validator");
const {
  hashPassword,
  generateRandomString,
  sendVerificationEmail,
  generateRandomCode,
} = require("../utils");
const nodemailer = require("nodemailer");
const e = require("express");
require("dotenv").config();

exports.login = async (req, res) => {
  let statusCode = -1;
  // let error_msg = "server error";
  try {
    if (!req.body) {
      statusCode = 400;
      throw "the request should have a body";
    }
    const { username = "", email = "", password = "" } = req.body;
    const missingFields = [];
    if (!email && !username) missingFields.push("email or username");
    if (!password) missingFields.push("password");
    if (missingFields.length > 0) {
      // IF 'MISSING FIELDS' ARRAY IS NOT EMPTY, RETURN ITS ELEMENTS AS A STRING
      statusCode = 400;
      throw "missing fields:" + missingFields.join(", ");
    }
    const usersModel = req.app.locals.models.users;

    const identifier = email ? email : username;
    const idType = email ? "email" : "username";
    const user = await usersModel.findByUsername(identifier, idType);
    if (!user) {
      statusCode = 401;
      throw `invalid ${idType} or password`;
    }
    const hashedPassword = hashPassword(password);
    if (user.password === hashedPassword) {
      // CLEAR FROM RESPONSE
      delete user.password;
      delete user._id;
      return res.status(200).json({ success: true, user: user });
    } else {
      statusCode = 401;
      throw "invalid email or password";
    }
  } catch (err) {
    console.log(err);
    return res
      .status(statusCode === -1 ? 500 : statusCode)
      .json({ success: false, error_msg: err });
  }
};

exports.register = async (req, res) => {
  let statusCode = -1;
  try {
    if (!req.body) {
      statusCode = 400;
      throw "the request should have a body";
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
      statusCode = 400;
      throw "missing fields:" + missingFields.join(", ");
    }
    if (!validator.isEmail(email)) {
      statusCode = 400;
      throw "invalid email address";
    }
    if (!validator.isMobilePhone(phone, "he-IL")) {
      statusCode = 400;
      throw "invalid phone number";
    }

    // GET THE USERS COLLECTION INSTANCE WE STORED IN 'APP.JS'
    const usersModel = req.app.locals.models.users;
    // CHECK IF THERE IS AN EXIST USER WITH THE SAME EMAIL OR PHONE
    const user = await usersModel.isUserExist(email, phone, username);

    if (user && user.email === email) {
      statusCode = 409;
      throw "this email is already in use";
    } else if (user && user.phone === phone) {
      statusCode = 409;
      throw "this phone number is already in use";
    } else if (user && user.username === username) {
      statusCode = 409;
      throw "this username is already in use";
    }
    const isOlderThan18 = validateAge(birthday);
    if (isOlderThan18 === null) {
      statusCode = 400;
      throw "invalid date format";
    }
    if (!isOlderThan18) {
      statusCode = 400;
      throw "you must be older than 18 years old";
    }
    const user_id = generateRandomString();

    const userData = { user_id, ...req.body };
    userData["first_name"] = capitalizeFirstLetter(userData["first_name"]);
    userData["last_name"] = capitalizeFirstLetter(userData["last_name"]);
    userData["password"] = hashPassword(userData["password"]);
    const result = await usersModel.create(userData);
    if (result.insertedCount) {
      const verificationModel = req.app.locals.models.verificationCodes;
      const verificationResult = await generateCodeAndSendToEmail(
        user_id,
        verificationModel,
        email
      );
      if (verificationResult.success) {
        return res.status(200).json({
          success: true,
          message: "verification email has been sent",
          user: userData,
        });
      } else {
        statusCode = 500;
        throw "server error";
      }
    } else {
      statusCode = 500;
      throw "server error";
    }
  } catch (err) {
    console.log(err);
    return res
      .status(statusCode === -1 ? 500 : statusCode)
      .json({ success: false, error_msg: err });
  }
};
exports.verifyEmail = async (req, res) => {
  let statusCode = -1;
  try {
    if (!req.body) {
      statusCode = 400;
      throw "the request should have a body";
    }
    const { user_id, code } = req.body;
    if (!user_id) {
      statusCode = 400;
      throw "user_id is required";
    }
    if (!code) {
      statusCode = 400;
      throw "verification code is required";
    }
    const verificationModel = req.app.locals.models.verificationCodes;
    const userModel = req.app.locals.models.users;
    const isVerified = await verificationModel.verifyCode(user_id, code);
    if (!isVerified) {
      statusCode = 400;
      throw "invalid verification code";
    }
    const userVerification = await userModel.verifyUser(user_id);
    if (userVerification.matchedCount === 0) {
      statusCode = 404;
      throw "user not found";
    }
    return res.status(200).json({ success: true, message: "email verified" });
  } catch (err) {
    console.log(err);
    return res
      .status(statusCode === -1 ? 500 : statusCode)
      .json({ success: false, error_msg: err });
  }
};

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
async function generateCodeAndSendToEmail(userId, verificationModel, email) {
  let result = {
    success: false,
    statusCode: -1,
    error_msg: "server error",
  };
  try {
    // GENERATE RANDOM CODE FOR EMAIL VERIFICATION
    const code = generateRandomCode(6);
    // SAVE THE CODE TO THE DATABASE
    const documentId = generateRandomString();

    const expiryDate = new Date(
      Date.now() + parseInt(process.env.VERIFICATION_CODE_EXPIRY) * 1000
    );
    const codeResult = await verificationModel.create(
      userId,
      documentId,
      code,
      expiryDate
    );

    if (codeResult.insertedCount === 0) {
      result.statusCode = 500;
      result.error = "server error";
      return result;
    }
    // SEND EMAIL TO THE USER
    const emailSent = await sendVerificationEmail(email, code);

    if (emailSent) {
      result.success = true;
      return result;
    } else {
      result.statusCode = 500;
      result.error = "server error";
      return result;
    }
  } catch (err) {
    console.log(err);
    result.statusCode = 500;
    result.error = "server error";
    return result;
  }
}

function capitalizeFirstLetter(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
