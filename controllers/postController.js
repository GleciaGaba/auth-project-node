const { createPostSchema } = require("../middlewares/validator");
const Post = require("../models/postsModels");

exports.getPosts = async (req, res) => {
  const { page } = req.query;
  const postsPerPage = 300;

  try {
    let pageNum = 0;
    if (page <= 1) {
      pageNum = 0;
    } else {
      pageNum = page - 1;
    }

    const result = await Post.find()
      .sort({ createdAt: -1 })
      .skip(pageNum * postsPerPage)
      .limit(postsPerPage)
      .populate({ path: "userId", select: "email" });
    res.status(200).json({ success: true, message: "posts", data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.createPost = async (req, res) => {
  const { title, description } = req.body;
  const { userId } = req.user;

  try {
    const { error, value } = createPostSchema.validate({
      title,
      description,
      userId,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const result = await Post.create({ title, description, userId });
    res.status(201).json({ success: true, message: "created", data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.singlePost = async (req, res) => {
  const { _id } = req.query;
  try {
    const existingPost = await Post.findOne({ _id }).populate({
      path: "userId",
      select: "email",
    });
    res
      .status(200)
      .json({ success: true, message: "single post", data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePost = async (req, res) => {
  const { _id } = req.query;
  console.log(_id);

  const { title, description } = req.body;
  const { userId } = req.user;
  console.log(userId);
  try {
    const { error, value } = createPostSchema.validate({
      title,
      description,
      userId,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    const existingPost = await Post.findById(_id);
    console.log(existingPost);

    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    if (existingPost.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    existingPost.title = title;
    existingPost.description = description;
    const result = await existingPost.save();
    res.status(200).json({ success: true, message: "Updated", data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  const { _id } = req.query;

  const { userId } = req.user;
  try {
    const existingPost = await Post.findOne({ _id });
    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post already unavailable" });
    }
    if (existingPost.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    await Post.deleteOne({ _id });
    res.status(200).json({ success: true, message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
