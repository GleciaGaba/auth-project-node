const express = require("express");
const { identifier } = require("../middlewares/identification");
const postController = require("../controllers/postController");
const router = express.Router();

router.get("/all-posts", identifier, postController.getPosts);
router.get("/single-post", postController.singlePost);
router.post("/create-post", identifier, postController.createPost);

router.put("/update-post", identifier, postController.updatePost);
router.delete("/delete-post", identifier, postController.deletePost);

module.exports = router;
