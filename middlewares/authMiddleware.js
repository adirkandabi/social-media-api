module.exports = (req, res, next) => {
    // דוגמה פשוטה: user_id עובר בכותרת
    const uid = req.header("x-user-id");
    if (!uid) return res.status(401).json({ message: "Unauthorized" });
    req.user = { id: uid };
    next();
};
