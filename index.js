require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Middleware to handle CORS
const passport = require("passport"); // OAuth with GitHub
const session = require("express-session"); // Added session middleware
const MongoStore = require("connect-mongo"); // Store sessions in MongoDB
const swaggerUi = require("swagger-ui-express"); // API documentation
const swaggerDocument = require("./swagger.json"); // Import Swagger Docs

require("./config/passport"); // Load Passport configuration

const app = express();

// Improved Middleware Setup
app.use(express.json()); // Parse JSON data

// Updated CORS Setup for API Requests & Authentication
app.use(cors({
    origin: ["http://localhost:3000", "https://cse-341-project2-qauj.onrender.com"], // Allow local & deployed versions
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true  // Enables cookies in authentication requests
}));

// Configure Session Middleware to Store Sessions in MongoDB
app.use(session({
    secret: process.env.SESSION_SECRET || "fallbacksecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions"
    }),
    cookie: {
        secure: process.env.NODE_ENV === "production", // Ensures `secure: true` only in production
        httpOnly: true,
        sameSite: "none" // Allows session persistence across domains
    }
}));

// Debugging Session Data for Authentication Issues
app.use((req, res, next) => {
    console.log("Session Data:", req.session);
    console.log("Authenticated:", req.isAuthenticated ? req.isAuthenticated() : "Function missing");
    next();
});

// Initialize Passport for GitHub OAuth
app.use(passport.initialize());
app.use(passport.session()); // Enables session support for login

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// API Documentation Route With Proper CORS Handling
app.use("/api-docs", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*"); // Dynamically allow origin
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    next();
}, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Import & Use Routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);

const postRoutes = require("./routes/postRoutes");
app.use("/posts", postRoutes);

// Basic Route to Confirm Server is Running
app.get("/", (req, res) => {
    res.send("Welcome to Project 2 API!");
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌍 Server running on port ${PORT}`);
});
