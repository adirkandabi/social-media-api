const express = require("express");
const router = express.Router();
const l = require("../../controllers/likesController");

router.post("/posts/:post_id/like", l.likePost);
router.get("/posts/:post_id/likes", l.getLikesCount);

module.exports = router;
