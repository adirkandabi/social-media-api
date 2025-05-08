const express = require("express");
const router = express.Router();
const profileController = require("../../controllers/profileController");
// CREATE - FILL PROFILE DETAILS
router.post("/", profileController.fillProfile);

// UPDATE PROFILE
router.patch("/", profileController.updateProfile);

module.exports = router;
