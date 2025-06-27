const express = require("express");
const router = express.Router();

router.get("/:room", async (req, res) => {
  const { room } = req.params;
  const db = req.app.locals.models;

  try {
    const messages = await db.message.getMessages(room);
    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to load messages" });
  }
});
router.get("/unread/:userId", async (req, res) => {
  const { userId } = req.params;
  const db = req.app.locals.models;

  try {
    const unreadSummary = await db.message.getUnreadSummary(userId);
    res.json({ unread: unreadSummary });
  } catch (error) {
    console.error("Error fetching unread summary:", error);
    res.status(500).json({ error: "Failed to fetch unread messages" });
  }
});
module.exports = router;
