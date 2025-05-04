const express = require("express");
const router = express.Router();

const authRouter = require("./user/auth");

router.use("/auth", authRouter);

module.exports = router;
