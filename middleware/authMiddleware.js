const ensureAuthenticated = (req, res, next) => {
    console.log("Session Data:", req.session);
    console.log("User Data:", req.user);
    
    if (req.session.passport && req.session.passport.user) { 
        return next();
    }

    res.status(401).json({ error: "Unauthorized, please log in via GitHub" });
};

module.exports = ensureAuthenticated;
