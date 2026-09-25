const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();


// ================= MIDDLEWARE =================

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());


// ================= ROUTES =================

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);


// ================= HOME =================

app.get("/", (req, res) => {
    res.json({
        message: "Expense Tracker Backend is Running"
    });
});


// ================= DATABASE =================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log(
            "MongoDB connection failed:",
            error.message
        );
    });


// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});