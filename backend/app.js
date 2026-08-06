const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const User = require("./models/User");
const authRoute = require("./routes/AuthRoute");
const studentRoute = require("./routes/StudentRoute");
const ExpressError = require("./utils/ExpressError");

const dbUrl = process.env.MONGO_URI || process.env.DB_URL || "mongodb://127.0.0.1:27017/campuscircle";

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));

app.use(express.json());
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
});
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", authRoute);
app.use("/api/profile", studentRoute);

// Catch-all route handler for undefined endpoints
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


// Centralized Express Error Handling Middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).json({
        success: false,
        message,
    });
});

// Connect to DB and start server
async function startServer() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to MongoDB successfully");
        await User.syncIndexes();

        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`Server is listening on Port: ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to connect to Database:", err);
    }
}

startServer();