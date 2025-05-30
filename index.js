require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Middleware to handle CORS
const passport = require("passport"); // OAuth with GitHub
const session = require("express-session"); // Added session middleware
const swaggerUi = require("swagger-ui-express"); // API documentation
const swaggerDocument = require("./swagger.json"); // Import Swagger Docs

require("./config/passport"); // Load Passport configuration

const app = express();

//  Middleware Setup
app.use(express.json()); // Parse JSON data
app.use(cors()); // Allow external API requests

//  Configure session (Added before Passport initialization)
app.use(session({
    secret: process.env.JWT_SECRET || "fallbacksecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to `true` in production with HTTPS
}));

// Initialize Passport for GitHub OAuth (After session setup)
app.use(passport.initialize());
app.use(passport.session()); // Enables session support for login

//  Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// API Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//  Import & Use Routes
const authRoutes = require("./routes/authRoutes"); //  Authentication routes added
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
