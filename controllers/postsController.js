// new post
exports.createPost = async (req, res) => {
  const posts = req.app.locals.models.posts;
  const { author_id, content, group_id } = req.body;

  if (!author_id || !content) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const post = {
    post_id: Date.now().toString(),
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

exports.getAllPosts = async (req, res) => {
  const posts = req.app.locals.models.posts;
  const users = req.app.locals.models.users;
  const groups = req.app.locals.models.groups;

  try {
    const filter = {};

    const authorId = req.query.author_id;
    const getFriendsPosts = req.query.get_friends_posts === "true";

    if (!authorId) {
      return res.status(400).json({ message: "Missing author_id" });
    }

    const user = await users.findByCustomId(authorId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's group memberships
    const memberGroups = await groups.collection
      .find({ members: authorId }, { projection: { group_id: 1 } })
      .toArray();

    const groupIds = memberGroups.map((g) => g.group_id);

    if (getFriendsPosts) {
      // Include posts from user, friends, and their groups
      filter.$or = [
        { author_id: { $in: [authorId, ...(user.friends || [])] } },
        { group_id: { $in: groupIds } },
      ];
    } else if (req.query.group_id) {
      filter.group_id = req.query.group_id;
    } else {
      // Only user's own posts
      filter.author_id = authorId;
    }

    const allPosts = await posts.list(filter);
    res.json(allPosts);
  } catch (error) {
    console.error("getAllPosts error:", error);
    res.status(500).json({ message: "Failed to fetch posts", error });
  }
};

// update post
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

// delete post
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

// search by parameters
exports.searchPosts = async (req, res) => {
  const posts = req.app.locals.models.posts;

  try {
    const results = await posts.search(req.query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed", details: err.message });
  }
};

// filter posts by group_id
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
