const express = require("express");
const router = express.Router();
const f = require("../../controllers/friendsController");

router.post("/add", f.addFriend);
router.post("/remove", f.removeFriend);
router.get("/:user_id", f.getFriends);

module.exports = router;
