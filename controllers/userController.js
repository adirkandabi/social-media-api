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
