const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/user");

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("🔥 GitHub Profile Received:", profile);
                
                let user = await User.findOne({ githubId: profile.id });

                if (!user) {
                    user = new User({
                        githubId: profile.id,
                        name: profile.displayName || "GitHub User",
                        email: profile.emails?.[0]?.value || "No public email"
                    });

                    await user.save();
                    console.log("✅ New User Created:", user);
                } else {
                    console.log("✅ Existing User Found:", user);
                }

                return done(null, user);
            } catch (err) {
                console.error("❌ Error in GitHub Authentication:", err);
                return done(err, null);
            }
        }
    )
);

// ✅ Serialize User into Session
passport.serializeUser((user, done) => {
    console.log("🔥 Serializing User:", user);
    done(null, user._id); // ✅ Store user ID for session tracking
});

// ✅ Deserialize User from Session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);

        if (!user) {
            console.error("❌ User not found during deserialization");
            return done(null, false);
        }

        console.log("🔥 Deserializing User:", user);
        done(null, user);
    } catch (error) {
        console.error("❌ Error in Deserialization:", error);
        done(error, null);
    }
});

module.exports = passport;
