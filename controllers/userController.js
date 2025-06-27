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
exports.sendFriendRequest = async (req, res) => {
  let statusCode = -1;
  try {
    const { user_id, friend_id } = req.body;
    if (!user_id || !friend_id) {
      statusCode = 400;
      throw "Both user_id and friend_id are required";
    }
    if (user_id === friend_id) {
      statusCode = 400;
      throw "You cannot send a friend request to yourself";
    }
    // Check if the user exists
    const userModel = req.app.locals.models.users;
    const user = await userModel.findByCustomId(user_id);
    if (!user) {
      statusCode = 404;
      throw `User ${user_id} not found`;
    }
    // Check if the friend exists
    const friend = await userModel.findByCustomId(friend_id);
    if (!friend) {
      statusCode = 404;
      throw `User ${friend_id} not found`;
    }
    const success = await userModel.sendFriendRequest(user_id, friend_id);
    if (!success) {
      statusCode = 500;
      throw "Failed to send friend request";
    }
    return res
      .status(200)
      .json({ success: true, message: "Friend request sent" });
  } catch (err) {
    console.error(err);
    return res
      .status(statusCode === -1 ? 500 : statusCode)
      .json({ success: false, error_msg: err });
  }
};
exports.acceptFriendRequest = async (req, res) => {
  let statusCode = -1;
  try {
    const { user_id, friend_id } = req.body;
    if (!user_id || !friend_id) {
      statusCode = 400;
      throw "Both user_id and friend_id are required";
    }
    if (user_id === friend_id) {
      statusCode = 400;
      throw "You cannot accept a friend request from yourself";
    }
    // Check if the user exists
    const userModel = req.app.locals.models.users;
    const user = await userModel.findByCustomId(user_id);
    if (!user) {
      statusCode = 404;
      throw `User ${user_id} not found`;
    }
    // Check if the friend exists
    const friend = await userModel.findByCustomId(friend_id);
    if (!friend) {
      statusCode = 404;
      throw `User ${friend_id} not found`;
    }
    const success = await userModel.acceptFriendRequest(user_id, friend_id);
    if (!success) {
      statusCode = 500;
      throw "Failed to accept friend request";
    }
    return res
      .status(200)
      .json({ success: true, message: "Friend request accepted" });
  } catch (err) {
    console.error(err);
    return res
      .status(statusCode === -1 ? 500 : statusCode)
      .json({ success: false, error_msg: err });
  }
};
exports.rejectFriendRequest = async (req, res) => {
  let statusCode = -1;
  try {
    const { user_id, friend_id } = req.body;
    if (!user_id || !friend_id) {
      statusCode = 400;
      throw "Both user_id and friend_id are required";
    }
    if (user_id === friend_id) {
      statusCode = 400;
      throw "You cannot reject a friend request from yourself";
    }
    // Check if the user exists
    const userModel = req.app.locals.models.users;
    const user = await userModel.findByCustomId(user_id);
    if (!user) {
      statusCode = 404;
      throw `User ${user_id} not found`;
    }
    // Check if the friend exists
    const friend = await userModel.findByCustomId(friend_id);
    if (!friend) {
      statusCode = 404;
      throw `User ${friend_id} not found`;
    }
    const success = await userModel.rejectFriendRequest(user_id, friend_id);
    if (!success) {
      statusCode = 500;
      throw "Failed to reject friend request";
    }
    return res
      .status(200)
      .json({ success: true, message: "Friend request rejected" });
  } catch (err) {
    console.error(err);
    return res
      .status(statusCode === -1 ? 500 : statusCode)
      .json({ success: false, error_msg: err });
  }
};
exports.cancelFriendRequest = async (req, res) => {
  let statusCode = -1;
  try {
    const { user_id, friend_id } = req.body;
    if (!user_id || !friend_id) {
      statusCode = 400;
      throw "Both user_id and friend_id are required";
    }
    if (user_id === friend_id) {
      statusCode = 400;
      throw "You cannot cancel a friend request to yourself";
    }
    // Check if the user exists
    const userModel = req.app.locals.models.users;
    const user = await userModel.findByCustomId(user_id);
    if (!user) {
      statusCode = 404;
      throw `User ${user_id} not found`;
    }
    // Check if the friend exists
    const friend = await userModel.findByCustomId(friend_id);
    if (!friend) {
      statusCode = 404;
      throw `User ${friend_id} not found`;
    }
    const success = await userModel.cancelFriendRequest(user_id, friend_id);
    if (!success) {
      statusCode = 500;
      throw "Failed to cancel friend request";
    }
    return res
      .status(200)
      .json({ success: true, message: "Friend request cancelled" });
  } catch (err) {
    console.error(err);
    return res
      .status(statusCode === -1 ? 500 : statusCode)
      .json({ success: false, error_msg: err });
  }
};
exports.deleteFriend = async (req, res) => {
  let statusCode = -1;
  try {
    const { user_id, friend_id } = req.body;
    if (!user_id || !friend_id) {
      statusCode = 400;
      throw "Both user_id and friend_id are required";
    }
    if (user_id === friend_id) {
      statusCode = 400;
      throw "You cannot delete yourself as a friend";
    }
    // Check if the user exists
    const userModel = req.app.locals.models.users;
    const user = await userModel.findByCustomId(user_id);
    if (!user) {
      statusCode = 404;
      throw `User ${user_id} not found`;
    }
    // Check if the friend exists
    const friend = await userModel.findByCustomId(friend_id);
    if (!friend) {
      statusCode = 404;
      throw `User ${friend_id} not found`;
    }
    const success = await userModel.deleteFriend(user_id, friend_id);
    if (!success) {
      statusCode = 500;
      throw "Failed to delete friend";
    }
    return res
      .status(200)
      .json({ success: true, message: "Friend deleted successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(statusCode === -1 ? 500 : statusCode)
      .json({ success: false, error_msg: err });
  }
};
exports.getRequests = async (req, res) => {
  let statusCode = -1;
  try {
    const user_id = req.params.user_id;
    if (!user_id) {
      statusCode = 400;
      throw "user_id is required";
    }
    const userModel = req.app.locals.models.users;
    const user = await userModel.findByCustomId(user_id);
    if (!user) {
      statusCode = 404;
      throw "User not found";
    }
    //  Add summarized received requests
    const requestRecievedIds = user.requests_recieved || [];
    const requestRecievedSummaries = await Promise.all(
      requestRecievedIds.map((id) =>
        userModel
          .findUserSummary(id)
          .then((r) => r[0])
          .catch(() => null)
      )
    );
    return res
      .status(200)
      .json({ success: true, requests: requestRecievedSummaries });
  } catch (err) {
    console.error(err);
    return res
      .status(statusCode === -1 ? 500 : statusCode)
      .json({ success: false, error_msg: err });
  }
};
exports.getAllFriends = async (req, res) => {
  try {
    let statusCode = -1;
    const user_id = req.params.user_id;
    if (!user_id) {
      statusCode = 400;
      throw "user_id is required";
    }
    const userModel = req.app.locals.models.users;
    const friends = await userModel.getFriends(user_id);
    if (friends === null) {
      statusCode = 404;
      throw "User not found";
    }
    return res.status(200).json({ friends: friends });
  } catch (err) {
    console.error(err);
    return res
      .status(statusCode === -1 ? 500 : statusCode)
      .json({ success: false, error_msg: err });
  }
};
