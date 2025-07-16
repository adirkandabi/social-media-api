const express = require("express");
const router = express.Router();
const profileController = require("../../controllers/profileController");

router.post("/", profileController.fillProfile);


router.patch("/", profileController.updateProfile);
router.get("/:user_id", profileController.getProfile);
module.exports = router;
