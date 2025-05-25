const express = require("express");
const router = express.Router();
const c = require("../../controllers/commentsController");

// comments always under a post
router.post("/posts/:post_id/comments", c.createComment);
router.get("/posts/:post_id/comments", c.getCommentsForPost);
router.put("/posts/:post_id/comments/:comment_id", c.updateComment);
router.delete("/posts/:post_id/comments/:comment_id", c.deleteComment);

module.exports = router;
