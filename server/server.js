require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes"); // Optional
const quizRoutes = require("./routes/quizRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api", authRoutes); // Optional
app.use("/api/quiz", quizRoutes);

app.listen(5000, () => console.log("🚀 Backend running on port 5000"));
