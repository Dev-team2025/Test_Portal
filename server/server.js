// server.js
require('dotenv').config({ quiet: true });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
const SchedulerService = require("./services/schedulerService");

const app = express();

// Database connection
connectDB();

// Initialize scheduler service
new SchedulerService();

// Allowed origins - add your production domain here
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5000",
    "http://localhost:3000",
    "http://157.245.111.79",
    "http://157.245.111.79:5000",
    "https://test-portal-srbl.onrender.com",
    process.env.FRONTEND_URL // Add your production frontend URL in .env
].filter(Boolean); // Remove undefined values

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // In production, be strict; in development, allow all
            if (process.env.NODE_ENV === "production") {
                callback(new Error('Not allowed by CORS'));
            } else {
                callback(null, true);
            }
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-quiz-start-time"]
}));

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// Routes
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const answerRoutes = require("./routes/answerRoutes");
const reportRoutes = require("./routes/reportRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/result", reportRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0"
    });
});

// Serve static files from the React app in production
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

// Handle React routing - send all non-API requests to index.html
// Express 5 requires regex pattern instead of "*"
app.get(/^\/(?!api).*/, (req, res) => {
    const indexPath = path.join(clientBuildPath, "index.html");
    const fs = require('fs');

    // Check if index.html exists, if not send a helpful error
    if (!fs.existsSync(indexPath)) {
        console.error(`[${new Date().toISOString()}] Error: index.html not found at ${indexPath}`);
        console.error(`Current directory: ${__dirname}`);
        console.error(`Looking for client build at: ${clientBuildPath}`);
        return res.status(404).json({
            error: "Client build not found",
            message: "Please build the client application first. Run: cd client && npm install && npm run build",
            path: clientBuildPath
        });
    }

    res.sendFile(indexPath);
});

// Error handler
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err.stack);
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message;
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
