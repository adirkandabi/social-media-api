
const sendError = (res, code, msg) =>
  res.status(code).json({ success: false, message: msg });

/* --------------------------------------------------------------------------
 *  GET  /users/:user_id 
 * ------------------------------------------------------------------------ */
exports.getUserById = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) return sendError(res, 400, "user_id is required");

    const userM = req.app.locals.models.users;
    const user = await userM.findByCustomId(user_id);
    if (!user) return sendError(res, 404, "User not found");

    user.name = user.username;
    delete user.password;
    return res.json(user);
  } catch (err) {
    console.error("getUserById error:", err);
    return sendError(res, 500, "Server error");
  }
};

/* --------------------------------------------------------------------------
 *  GET  /users?id=xxxx 
 * ------------------------------------------------------------------------ */
exports.getUser = async (req, res) => {
  try {
    const user_id = req.query.id;
    if (!user_id) return sendError(res, 400, "user_id is required");

    const userM = req.app.locals.models.users;
    const user = await userM.findByCustomId(user_id);
    if (!user) return sendError(res, 404, "User not found");


    user.name = user.username; // לבדוק מה אני מעדיף first_name + last_name

    delete user.password;
    return res.json(user);
  } catch (err) {
    console.error("getUser error:", err);
    return sendError(res, 500, "Server error");
  }
};

/* --------------------------------------------------------------------------
 *  GET  /users/list?q=term 
 * ------------------------------------------------------------------------ */
exports.searchUsers = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return sendError(res, 400, "Search query is required");

    const regex = new RegExp(q, "i");
    const userM = req.app.locals.models.users;
    const users = await userM.findBySearch(regex);

    return res.json({ success: true, users });
  } catch (err) {
    console.error("searchUsers error:", err);
    return sendError(res, 500, "Server error");
  }
};


/* ==========================================================================
 *  SECTION: Friend-Request / Friends
 * ======================================================================== */

exports.sendFriendRequest = async (req, res) => friendRequestWrapper(req, res, "send");
exports.acceptFriendRequest = async (req, res) => friendRequestWrapper(req, res, "accept");
exports.rejectFriendRequest = async (req, res) => friendRequestWrapper(req, res, "reject");
exports.cancelFriendRequest = async (req, res) => friendRequestWrapper(req, res, "cancel");
exports.deleteFriend = async (req, res) => friendRequestWrapper(req, res, "delete");

async function friendRequestWrapper(req, res, action) {
  const { user_id, friend_id } = req.body;
  if (!user_id || !friend_id) return sendError(res, 400, "Both user_id and friend_id are required");
  if (user_id === friend_id) return sendError(res, 400, "Cannot perform this action on yourself");

  try {
    const usersM = req.app.locals.models.users;
    const user = await usersM.findByCustomId(user_id);
    const friend = await usersM.findByCustomId(friend_id);
    if (!user || !friend) return sendError(res, 404, "User not found");

    let ok = false, message = "";
    switch (action) {
      case "send": ok = await usersM.sendFriendRequest(user_id, friend_id); message = "Friend request sent"; break;
      case "accept": ok = await usersM.acceptFriendRequest(user_id, friend_id); message = "Friend request accepted"; break;
      case "reject": ok = await usersM.rejectFriendRequest(user_id, friend_id); message = "Friend request rejected"; break;
      case "cancel": ok = await usersM.cancelFriendRequest(user_id, friend_id); message = "Friend request cancelled"; break;
      case "delete": ok = await usersM.deleteFriend(user_id, friend_id); message = "Friend deleted successfully"; break;
    }

    if (!ok) return sendError(res, 500, "Operation failed");
    return res.json({ success: true, message });
  } catch (err) {
    console.error(`${action}FriendRequest error:`, err);
    return sendError(res, 500, "Server error");
  }
}

/* --------------------------------------------------------------------------
 *  GET  /users/:user_id/requests  
 * ------------------------------------------------------------------------ */
exports.getRequests = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) return sendError(res, 400, "user_id is required");

    const usersM = req.app.locals.models.users;
    const user = await usersM.findByCustomId(user_id);
    if (!user) return sendError(res, 404, "User not found");

    const ids = user.requests_recieved || [];
    const requests = await usersM.getUsersByIds(ids);

    return res.json({ success: true, requests });
  } catch (err) {
    console.error("getRequests error:", err);
    return sendError(res, 500, "Server error");
  }
};

/* --------------------------------------------------------------------------
 *  GET  /users/:user_id/friends   
 * ------------------------------------------------------------------------ */
exports.getAllFriends = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) return sendError(res, 400, "user_id is required");

    const usersM = req.app.locals.models.users;
    const friends = await usersM.getFriends(user_id);
    if (friends === null) return sendError(res, 404, "User not found");

    return res.json({ success: true, friends });
  } catch (err) {
    console.error("getAllFriends error:", err);
    return sendError(res, 500, "Server error");
  }
};

/* --------------------------------------------------------------------------
 *  POST /users/batch   { user_ids: [...] } 
 * ------------------------------------------------------------------------ */
exports.getUsersByIds = async (req, res) => {
  try {
    const ids = req.body.user_ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 400, "user_ids must be a non-empty array");
    }

    const users = await req.app.locals.models.users.getUsersByIds(ids);
    return res.json(users);
  } catch (err) {
    console.error("getUsersByIds error:", err);
    return sendError(res, 500, "Server error");
  }
};
