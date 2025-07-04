require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const connectDB = require("./config/db");
const SchedulerService = require("./services/schedulerService");

// Route imports
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const answerRoutes = require("./routes/answerRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Initialize Express app
const app = express();

// Database connection
connectDB();

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/report", reportRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0"
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found",
        requestedUrl: req.originalUrl
    });
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err.stack);

    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message;

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
    });
});

// Initialize schedulers
const scheduler = new SchedulerService();

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server information:`);
    console.log(`   Mode: ${process.env.NODE_ENV || "development"}`);
    console.log(`   Port: ${PORT}`);
    console.log(`   API Base: http://localhost:${PORT}/api`);
    console.log(`   Database: ${process.env.MONGO_URI ? "Connected" : "Not configured"}`);
    console.log(`   Schedulers: Active\n`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});

process.on("SIGINT", () => {
    console.log("SIGINT received. Shutting down gracefully...");
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});

module.exports = server; 