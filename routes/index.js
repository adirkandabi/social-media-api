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

const u = require("../controllers/userController");

router.use("/user", userRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/user/settings", settingsRouter);
router.use("/posts", postsRouter);
router.use("/groups", groupsRouter);
router.use("/", commentsRt);
router.use("/", likesRt);

//router.get("/user/:user_id", u.getUserById);

module.exports = router;
