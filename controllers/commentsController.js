const nextId = () => Date.now().toString();

exports.createComment = async (req, res) => {
    const comments = req.app.locals.models.comments;
    const { content, author_id } = req.body;
    if (!content) return res.status(400).json({ message: "content required" });

    const comment = {
        comment_id: nextId(),
        post_id: req.params.post_id,
        author_id,
        content,
        created_at: new Date(),
        updated_at: null,
    };
    await comments.create(comment);
    res.status(201).json({ message: "Comment added", comment });
};

exports.getCommentsForPost = async (req, res) => {
    const comments = req.app.locals.models.comments;
    const list = await comments.listByPost(req.params.post_id);
    res.json(list);
};

exports.updateComment = async (req, res) => {
    const comments = req.app.locals.models.comments;
    const result = await comments.update(req.params.comment_id, {
        ...req.body,
        updated_at: new Date(),
    });
    if (!result.matchedCount)
        return res.status(404).json({ message: "Comment not found" });
    res.json({ message: "Comment updated" });
};

exports.deleteComment = async (req, res) => {
    const comments = req.app.locals.models.comments;
    const result = await comments.delete(req.params.comment_id);
    if (!result.deletedCount)
        return res.status(404).json({ message: "Comment not found" });
    res.json({ message: "Comment deleted" });
};
