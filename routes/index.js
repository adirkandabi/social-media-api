const express = require("express");
const router = express.Router();

const authRouter = require("./user/auth");
const profileRouter = require("./user/profile");
const settingsRouter = require("./user/settings");

router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/user/settings", settingsRouter);
module.exports = router;
