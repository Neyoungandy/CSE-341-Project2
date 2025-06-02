const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/user");

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.Callback_URL || "https://cse-341-project2-qauj.onrender.com/auth/github/callback" // Uses .env for flexibility
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ githubId: profile.id });
                if (!user) {
                    user = new User({
                        githubId: profile.id,
                        name: profile.displayName || "GitHub User",
                        email: profile.emails?.[0]?.value || "No public email",
                    });
                    await user.save();
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

// Updated: Use session-based authentication
passport.serializeUser((user, done) => {
    done(null, user); // Store full user object
});

passport.deserializeUser(async (user, done) => {
    console.log("Deserializing user:", user); // 🔥 Debugging step
    done(null, user);
});



module.exports = passport;
