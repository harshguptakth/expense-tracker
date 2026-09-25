const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// All transaction routes require login
router.use(authMiddleware);


// ================= ADD TRANSACTION =================

router.post("/add", async (req, res) => {
    try {
        const {
            title,
            amount,
            type,
            category,
            date
        } = req.body;

        if (
            !title ||
            amount === undefined ||
            !type ||
            !category
        ) {
            return res.status(400).json({
                message: "All required fields are needed"
            });
        }

        const transaction = await Transaction.create({
            userId: req.userId,
            title: title.trim(),
            amount: Number(amount),
            type,
            category,
            date: date || new Date()
        });

        res.status(201).json({
            message: "Transaction added successfully",
            transaction
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


// ================= GET TRANSACTIONS =================

router.get("/", async (req, res) => {
    try {
        const transactions = await Transaction.find({
            userId: req.userId
        }).sort({
            date: -1,
            createdAt: -1
        });

        res.json({
            transactions
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


// ================= SUMMARY =================

router.get("/summary", async (req, res) => {
    try {
        const transactions = await Transaction.find({
            userId: req.userId
        });

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach((transaction) => {
            if (transaction.type === "income") {
                totalIncome += transaction.amount;
            }

            if (transaction.type === "expense") {
                totalExpense += transaction.amount;
            }
        });

        const balance = totalIncome - totalExpense;

        const savingsRate =
            totalIncome > 0
                ? Math.round((balance / totalIncome) * 100)
                : 0;

        res.json({
            totalIncome,
            totalExpense,
            balance,
            savingsRate
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


// ================= UPDATE =================

router.put("/:id", async (req, res) => {
    try {
        const {
            title,
            amount,
            type,
            category,
            date
        } = req.body;

        const transaction =
            await Transaction.findOneAndUpdate(
                {
                    _id: req.params.id,
                    userId: req.userId
                },
                {
                    title,
                    amount: Number(amount),
                    type,
                    category,
                    date
                },
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction updated successfully",
            transaction
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


// ================= DELETE =================

router.delete("/:id", async (req, res) => {
    try {
        const transaction =
            await Transaction.findOneAndDelete({
                _id: req.params.id,
                userId: req.userId
            });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


module.exports = router;