const Post = require("../models/post");

// ✅ GET: Retrieve all posts
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate("author", "name email");
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: "Error fetching posts" });
    }
};

// ✅ POST: Create a new post
const createPost = async (req, res) => {
    try {
        const { title, content, author } = req.body;
        if (!title || !content || !author) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const newPost = new Post({ title, content, author });
        await newPost.save();
        res.status(201).json({ message: "Post created successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error creating post" });
    }
};

// ✅ PUT: Update a post by ID
const updatePost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.findByIdAndUpdate(req.params.id, { title, content }, { new: true });
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: "Error updating post" });
    }
};

// ✅ DELETE: Remove a post by ID
const deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting post" });
    }
};

module.exports = { getPosts, createPost, updatePost, deletePost };
