const ensureAuthenticated = (req, res, next) => {
    console.log(" Debugging Authentication Middleware");
    console.log(" Session Data:", req.session);
    console.log(" Passport Session:", req.session.passport);
    console.log(" User Data:", req.user);

    // Standard Passport Authentication Check
    if (req.isAuthenticated && req.isAuthenticated()) {
        console.log(" User is authenticated via Passport");
        return next();
    }

    // Secondary Check: Ensure `req.user` exists in session
    if (req.user) { 
        console.log(" User exists in session, authentication valid");
        return next();
    }

    console.log("❌ Authentication Failed - Redirecting");
    res.status(401).json({ error: "Unauthorized, please log in via GitHub" });
};

module.exports = ensureAuthenticated;
