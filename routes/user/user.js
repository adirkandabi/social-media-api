const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");

router.get("/list", userController.searchUsers);
router.get("/:user_id/requests", userController.getRequests);
router.get("/:user_id/friends", userController.getAllFriends);

router.get("/", userController.getUser);
router.get("/:user_id", userController.getUserById);

router.post("/send-friend-request", userController.sendFriendRequest);
router.post("/accept-friend-request", userController.acceptFriendRequest);
router.post("/reject-friend-request", userController.rejectFriendRequest);
router.post("/cancel-friend-request", userController.cancelFriendRequest);
router.post("/delete-friend", userController.deleteFriend);
router.post("/batch", userController.getUsersByIds);

module.exports = router;
