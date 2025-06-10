require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use("/api", authRoutes);
app.use("/api/quiz", quizRoutes);

app.listen(5000, () => console.log("🚀 Backend running on port 5000"));
