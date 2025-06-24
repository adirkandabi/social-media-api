exports.getUser = async (req, res) => {
  let statusCode = -1;
  try {
    const user_id = req.query.id;
    if (!user_id) {
      statusCode = 400;
      throw "user_id is required";
    }
    const userModel = req.app.locals.models.users;
    const user = await userModel.findByCustomId(user_id);
    if (!user) {
      statusCode = 404;
      throw "user not found";
    }
    delete user.password; // Remove password from the response
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.log(err);
    return res
      .status(statusCode === -1 ? 500 : statusCode)
      .json({ success: false, error_msg: err ? err : "server error" });
  }
};
exports.searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res
        .status(400)
        .json({ success: false, error_msg: "Search query is required" });
    }

    const userModel = req.app.locals.models.users;

    const regex = new RegExp(query, "i"); // Case-insensitive regex

    const users = await userModel.findBySearch(regex);

    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error_msg: "Server error" });
  }
};
