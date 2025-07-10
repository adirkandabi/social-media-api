// יצירת פוסט חדש
exports.createPost = async (req, res) => {
  const posts = req.app.locals.models.posts;
  const { author_id, content, group_id } = req.body;

  if (!author_id || !content) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const post = {
    post_id: Date.now().toString(), // שימוש במקום UUID
    author_id,
    content,
    group_id: group_id || null,
    created_at: new Date(),
    updated_at: null,
  };

  try {
    await posts.create(post);
    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("❌ Error creating post:", JSON.stringify(error, null, 2));
    res.status(500).json({
      message: "Failed to create post",
      error: error.message || error,
    });
  }
};

// קבלת פוסט לפי מזהה
exports.getPostById = async (req, res) => {
  const posts = req.app.locals.models.posts;
  const { post_id } = req.params;

  try {
    const post = await posts.findByCustomId(post_id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error });
  }
};

// קבלת כל הפוסטים עם מחברים מתוך המודל
exports.getAllPosts = async (req, res) => {
  const posts = req.app.locals.models.posts;
  const users = req.app.locals.models.users;

  try {
    const filter = {};

    if (req.query.group_id) {
      filter.group_id = req.query.group_id;
    }

    if (req.query.author_id && req.query.get_friends_posts !== "true") {
      filter.author_id = req.query.author_id;
    }

    if (req.query.author_id && req.query.get_friends_posts === "true") {
      const user = await users.findByCustomId(req.query.author_id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      filter.author_id = {
        $in: [req.query.author_id, ...(user.friends || [])],
      };
    }

    const allPosts = await posts.list(filter);
    res.json(allPosts);
  } catch (error) {
    console.error("getAllPosts error:", error);
    res.status(500).json({ message: "Failed to fetch posts", error });
  }
};

// עדכון פוסט
exports.updatePost = async (req, res) => {
  const posts = req.app.locals.models.posts;
  const { post_id } = req.params;
  const updateData = req.body;

  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "No data provided for update" });
  }

  updateData.updated_at = new Date();

  try {
    const result = await posts.update(post_id, updateData);
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update post", error });
  }
};

// מחיקת פוסט
exports.deletePost = async (req, res) => {
  const posts = req.app.locals.models.posts;
  const { post_id } = req.params;

  try {
    const result = await posts.delete(post_id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post", error });
  }
};

// חיפוש פוסטים לפי פרמטרים
exports.searchPosts = async (req, res) => {
  const posts = req.app.locals.models.posts;

  try {
    const results = await posts.search(req.query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed", details: err.message });
  }
};

// סינון פוסטים לפי מזהה קבוצה
exports.getPostsByGroup = async (req, res) => {
  const posts = req.app.locals.models.posts;
  const { group_id } = req.query;

  if (!group_id) {
    return res
      .status(400)
      .json({ message: "Missing group_id query parameter" });
  }

  try {
    const filteredPosts = await posts.list({ group_id });
    res.json(filteredPosts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch posts by group_id",
      error: error.message || error,
    });
  }
};
