const express = require("express");
const router = express.Router();

const authRouter = require("./user/auth");
const profileRouter = require("./user/profile");
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
module.exports = router;
