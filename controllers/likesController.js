exports.likePost = async (req, res) => {
    const likes = req.app.locals.models.likes;
    const result = await likes.like(req.params.post_id, req.body.user_id);
    if (result.upsertedCount === 0)
        return res.status(409).json({ message: "Already liked" });
    const count = await likes.count(req.params.post_id);
    res.json({ message: "Liked", likes_count: count });
};

exports.getLikesCount = async (req, res) => {
    const likes = req.app.locals.models.likes;
    const count = await likes.count(req.params.post_id);
    res.json({ post_id: req.params.post_id, likes: count });
};
