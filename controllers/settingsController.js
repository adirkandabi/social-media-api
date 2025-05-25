const { hashPassword } = require("../utils");

exports.changeName = async (req, res) => {
  let statusCode = -1;
  try {
    if (!req.body) {
      statusCode = 400;
      throw "the request should have a body";
    }
    const { user_id, first_name, last_name } = req.body;
    if (!user_id) {
      statusCode = 400;
      throw "user_id is required";
    }
    const name = {};
    if (first_name) {
      name.first_name = first_name;
    }
    if (last_name) {
      name.last_name = last_name;
    }
    if (Object.keys(name).length === 0) {
      statusCode = 400;
      throw "At least one of first_name or last_name must have a value";
    }
    const usersModel = req.app.locals.models.users;
    const result = await usersModel.updateName(user_id, name);
    if (result.matchedCount === 0) {
      statusCode = 404;
      throw "User not found";
    }
    return res.status(200).json({ success: true, message: "Name updated" });
  } catch (error) {
    console.log(error);
    return res.status(statusCode !== -1 ? statusCode : 500).json({
      success: false,
      error_msg:
        typeof error === "string"
          ? error
          : error.message || "Internal Server Error",
    });
  }
};
exports.changePassword = async (req, res) => {
  let statusCode = -1;
  try {
    if (!req.body) {
      statusCode = 400;
      throw "the request should have a body";
    }
    const { user_id, old_password, new_password } = req.body;
    if (!user_id) {
      statusCode = 400;
      throw "user_id is required";
    }
    if (!old_password || !new_password) {
      statusCode = 400;
      throw "old_password and new_password are required";
    }
    const usersModel = req.app.locals.models.users;
    const user = await usersModel.findByCustomId(user_id);
    if (!user) {
      statusCode = 404;
      throw "User not found";
    }
    const hashedOldPassword = hashPassword(old_password);
    if (user.password !== hashedOldPassword) {
      statusCode = 401;
      throw "Invalid old password";
    }
    const hashedNewPassword = hashPassword(new_password);
    await usersModel.updatePassword(user_id, hashedNewPassword);
    return res.status(200).json({ success: true, message: "Password updated" });
  } catch (error) {
    console.log(error);
    return res.status(statusCode !== -1 ? statusCode : 500).json({
      success: false,
      error_msg:
        typeof error === "string"
          ? error
          : error.message || "Internal Server Error",
    });
  }
};
