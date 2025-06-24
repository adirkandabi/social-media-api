const express = require("express");
const router = express.Router();
const userRouter = require("./user/user");
const authRouter = require("./user/auth");
const profileRouter = require("./user/profile");

const postsRouter = require("./posts/post");
const groupsRouter = require("./groups"); //
const commentsRt = require("./comments"); //
const likesRt = require("./likes"); //

const settingsRouter = require("./user/settings");

router.use("/user", userRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/user/settings", settingsRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/posts", postsRouter);
router.use("/groups", groupsRouter); // /groups/…
router.use("/", commentsRt); // /posts/:post_id/comments…
router.use("/", likesRt); // /posts/:post_id/like …

module.exports = router;
