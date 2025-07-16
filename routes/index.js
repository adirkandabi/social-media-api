const express = require("express");
const router = express.Router();

const userRouter = require("./user/user");
const authRouter = require("./user/auth");
const profileRouter = require("./user/profile");
const settingsRouter = require("./user/settings");

const postsRouter = require("./posts/post");
const groupsRouter = require("./groups");
const commentsRt = require("./comments");
const likesRt = require("./likes");



router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/user/settings", settingsRouter);
router.use("/posts", postsRouter);
router.use("/groups", groupsRouter);
router.use("/", commentsRt);
router.use("/", likesRt);



module.exports = router;
