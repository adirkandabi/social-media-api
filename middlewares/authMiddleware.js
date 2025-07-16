module.exports = (req, res, next) => {

    const uid = req.header("x-user-id");
    if (!uid) return res.status(401).json({ message: "Unauthorized" });
    req.user = { id: uid };
    next();
};
