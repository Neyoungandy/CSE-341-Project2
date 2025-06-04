require("dotenv").config(); // Load environment variables

const GitHubStrategy = require("passport-github2").Strategy;
const MongoStore = require("connect-mongo");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Middleware to handle CORS
const passport = require("passport"); // OAuth with GitHub
const session = require("express-session"); // Added session middleware
const swaggerUi = require("swagger-ui-express"); // API documentation
const swaggerDocument = require("./swagger.json"); // Import Swagger Docs

require("./config/passport"); // Load Passport configuration

const app = express();

// Middleware Setup
app.use(express.json()); // Parse JSON data

// Improved CORS Setup
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://cse-341-project2-qauj.onrender.com' : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Configure session (Before Passport initialization)
app.use(session({
    secret: process.env.SESSION_SECRET || "fallbacksecret",
    resave: false, //  Prevents unnecessary session overwrites
    saveUninitialized: false, // Ensures session is only stored after authentication
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions"
    }),
    cookie: {
        secure: process.env.NODE_ENV === "production", // Set `false` locally, `true` for Render
        httpOnly: true,
        sameSite: "lax", // ✅ Fix session persistence issue
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));


app.use(passport.initialize());
app.use(passport.session());



// Debug Route to Check Session Persistence
app.get("/session-debug", (req, res) => {
    res.json({
        session: req.session,
        passportData: req.session.passport,
        user: req.user,
        authenticated: req.isAuthenticated ? req.isAuthenticated() : "Function missing"
    });
});

// Corrected MongoDB Connection Setup
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// API Documentation Route
app.use("/api-docs", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    next();
}, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/auth-debug", (req, res) => {
    res.json({
        message: "Auth Debug Info",
        session: req.session,
        passportData: req.session.passport,
        user: req.user,
        authenticated: req.isAuthenticated ? req.isAuthenticated() : "Function missing"
    });
});

// Debugging middleware (before routes)
app.use((req, res, next) => {
    console.log("🔥 Middleware Debugging - Incoming Request:", req.method, req.url);
    console.log("🔥 Session Data:", req.session);
    console.log("🔥 Passport Session Data:", req.session.passport);
    console.log("🔥 User Data:", req.user);
    console.log("🔥 Authenticated:", req.isAuthenticated ? req.isAuthenticated() : "Function missing");
    next();
});

// Temporary `/dashboard` Route to Handle Login Redirection
app.get("/dashboard", (req, res) => {
    console.log("🔥 Checking Authentication for Dashboard");
    console.log("🔥 Session Data:", req.session);
    console.log("🔥 Passport Session Data:", req.session.passport);
    console.log("🔥 User Data:", req.user);
    
    // ✅ Check both Passport authentication and session persistence
    if (req.user || (req.session && req.session.passport && req.session.passport.user)) {
        res.json({
            message: "Welcome to your dashboard!",
            user: req.user
        });
    } else {
        res.status(401).json({ error: "Unauthorized. Please log in via GitHub." });
    }
});


//  Import & Use Routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);

const postRoutes = require("./routes/postRoutes");
app.use("/posts", postRoutes);

//  Basic Route to Confirm Server is Running
app.get("/", (req, res) => {
    res.send("Welcome to Project 2 API!");
});

//  Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌍 Server running on port ${PORT}`);
});
