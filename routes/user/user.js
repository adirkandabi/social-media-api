const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");

router.get("/list", userController.searchUsers);                  // /users/list?q=...
router.get("/:user_id/requests", userController.getRequests);    // /users/:user_id/requests
router.get("/:user_id/friends", userController.getAllFriends);   // /users/:user_id/friends

router.get("/", userController.getUser);                         // /users?id=...
router.get("/:user_id", userController.getUserById);             // /users/:user_id

router.post("/send-friend-request", userController.sendFriendRequest);
router.post("/accept-friend-request", userController.acceptFriendRequest);
router.post("/reject-friend-request", userController.rejectFriendRequest);
router.post("/cancel-friend-request", userController.cancelFriendRequest);
router.post("/delete-friend", userController.deleteFriend);
router.post("/batch", userController.getUsersByIds);

module.exports = router;
