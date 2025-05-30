const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { getUsers, createUser, updateUser, deleteUser } = require("../controllers/userController");
const authenticateJWT = require("../middleware/authMiddleware"); // Import authentication middleware

const router = express.Router();

//  GET: Retrieve all users (Protected)
router.get("/", authenticateJWT, getUsers);

//  POST: Create new user with validation
router.post(
    "/",
    [
        body("name").isString().trim().isLength({ min: 3 }).withMessage("Name must be at least 3 characters"),
        body("email").isEmail().normalizeEmail().withMessage("Invalid email format"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    createUser
);

//  PUT: Update user with validation (Protected)
router.put(
    "/:id",
    authenticateJWT, // Require authentication before updating a user
    [
        param("id").isMongoId().withMessage("Invalid User ID"),
        body("name").optional().isString().trim().isLength({ min: 3 }).withMessage("Name must be at least 3 characters"),
        body("email").optional().isEmail().normalizeEmail().withMessage("Invalid email format"),
        body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    updateUser
);

//  DELETE: Validate User ID before deleting (Protected)
router.delete(
    "/:id",
    authenticateJWT, // Require authentication before deleting a user
    [
        param("id").isMongoId().withMessage("Invalid User ID"),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    deleteUser
);

module.exports = router;


