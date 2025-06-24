const express = require("express");
const router = express.Router();
const g = require("../../controllers/groupsController");

router.post("/", g.createGroup);
router.get("/", g.getAllGroups);
router.get("/user/:user_id", g.getGroupsByUser);
router.get("/:group_id", g.getGroupById);
router.put("/:group_id", g.updateGroup);
router.delete("/:group_id", g.deleteGroup);
router.post("/:group_id/join", g.joinGroup);
router.post("/:group_id/leave", g.leaveGroup);


module.exports = router;
