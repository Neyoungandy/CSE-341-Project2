const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { getPosts, createPost, updatePost, deletePost } = require("../controllers/postController");

const router = express.Router();

router.get("/", getPosts);

router.post(
    "/",
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

router.put(
    "/:id",
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

router.delete(
    "/:id",
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
