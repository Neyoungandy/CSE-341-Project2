const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { // Check if user is logged in via session
        return next();
    }
    res.status(401).json({ error: "Unauthorized, please log in via GitHub" });
};

module.exports = ensureAuthenticated;
