require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const connectDB = require("./config/db");

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-quiz-start-time'],
    credentials: true
}));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// Root test route
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0"
    });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use('/api/questions', require("./routes/questionRoutes"));
app.use("/api/answers", require("./routes/answerRoutes"));
app.use('/api/result', require("./routes/reportRoutes"));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found",
        requestedUrl: req.originalUrl
    });
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
