const express = require("express");
const passport = require("passport");
const User = require("../models/user");

require("../config/passport");

const router = express.Router();

// GitHub OAuth Login
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// GitHub OAuth Callback (Session-Based Authentication)
router.get(
    "/github/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    (req, res) => {
        res.send("Login successful! You are now authenticated.");

    }
);

// Logout (Clears Session)
router.get("/logout", (req, res) => {
    req.logout(() => {
        req.session.destroy(() => {
            res.json({ message: "Logged out successfully" });
        });
    });
});

// Middleware to Protect Routes
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Unauthorized, please log in via GitHub" });
};

// Example of a Protected Route (Requires Session)
router.get("/profile", ensureAuthenticated, (req, res) => {
    res.json({
        id: req.user.githubId,
        name: req.user.name,
        email: req.user.email,
    });
});

module.exports = router;
