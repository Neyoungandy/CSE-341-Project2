const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { getPosts, createPost, updatePost, deletePost } = require("../controllers/postController");
const ensureAuthenticated = require("../middleware/authMiddleware"); // ✅ Updated authentication middleware import

const router = express.Router();

//  ✅ GET: Retrieve all posts (Protected)
router.get("/", ensureAuthenticated, getPosts);

//  ✅ POST: Create new post with validation (Protected)
router.post(
    "/",
    ensureAuthenticated, // ✅ Require authentication before creating a post
    [
        body("title").isString().trim().isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),
        body("content").isString().trim().isLength({ min: 10 }).withMessage("Content must be at least 10 characters"),
        body("author").isMongoId().withMessage("Invalid Author ID"),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    createPost
);

//  ✅ PUT: Update post with validation (Protected)
router.put(
    "/:id",
    ensureAuthenticated, // ✅ Require authentication before updating a post
    [
        param("id").isMongoId().withMessage("Invalid Post ID"),
        body("title").optional().isString().trim().isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),
        body("content").optional().isString().trim().isLength({ min: 10 }).withMessage("Content must be at least 10 characters"),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    updatePost
);

//  ✅ DELETE: Validate Post ID before deleting (Protected)
router.delete(
    "/:id",
    ensureAuthenticated, // ✅ Require authentication before deleting a post
    [param("id").isMongoId().withMessage("Invalid Post ID")],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    deletePost
);

module.exports = router;
