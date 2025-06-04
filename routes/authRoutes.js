const express = require("express");
const passport = require("passport");
const User = require("../models/user");

require("../config/passport");

const router = express.Router();

// ✅ Initiate GitHub Authentication
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// ✅ Handle GitHub OAuth Callback
router.get("/github/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    async (req, res) => {
        console.log("🔥 OAuth Callback - User Authenticated:", req.user);

        if (!req.user) {
            return res.status(401).json({ error: "Authentication failed. Please try again." });
        }

        try {
            // ✅ Attach authenticated user to session
            req.session.user = req.user;
            await req.session.save(); // 🔥 Ensure session is stored

            console.log("🔥 Session Saved Successfully:", req.session);
            res.redirect("/dashboard"); // ✅ Redirect after successful authentication
        } catch (error) {
            console.error("❌ Error Saving Session:", error);
            res.status(500).json({ error: "Session storage failed. Please try again." });
        }
    }
);

// ✅ Logout User
router.get("/logout", (req, res) => {
    req.logout(err => {
        if (err) {
            console.error("❌ Logout Error:", err);
            return res.status(500).json({ error: "Logout failed" });
        }

        req.session.destroy(() => {
            console.log("🔥 Session Destroyed - User Logged Out");
            res.redirect("/");
        });
    });
});

module.exports = router;
