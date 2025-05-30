const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("../config/passport");

const router = express.Router();

// Register (Traditional Login)
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: "Email already exists" });
        }

        user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debugging JWT_SECRET

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// GitHub OAuth Login
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// GitHub OAuth Callback
router.get(
    "/github/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    (req, res) => {
        const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    }
);

// Logout
router.post("/logout", (req, res) => {
    req.logout(() => {
        res.json({ message: "Logged out successfully" });
    });
});

module.exports = router;
