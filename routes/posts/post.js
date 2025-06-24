const express = require("express");
const router = express.Router();
const postsController = require("../../controllers/postsController");
const auth = require("../../middlewares/authMiddleware");


router.post("/", postsController.createPost);
router.get("/", postsController.getAllPosts);
router.get("/search/advanced", postsController.searchPosts);
router.get("/filter/by-group", postsController.getPostsByGroup);
router.get("/:post_id", postsController.getPostById);
router.put("/:post_id", postsController.updatePost);
router.delete("/:post_id", postsController.deletePost);
router.get("/user/:user_id", postsController.getPostsByUserId);


module.exports = router;
