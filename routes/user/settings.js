const express = require("express");
const router = express.Router();
const settingsController = require("../../controllers/settingsController");
router.post("/change-name", settingsController.changeName);
router.post("/change-password", settingsController.changePassword);
//TODO:
// router.post("/change-email", settingsController.changeEmail);

module.exports = router;
