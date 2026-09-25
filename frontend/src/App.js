import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

const categories = [
    "Food",
    "Shopping",
    "Travel",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Salary",
    "Freelance",
    "Other"
];


// =====================================================
// AUTH SCREEN
// =====================================================

function AuthScreen({ onLogin }) {
    const [mode, setMode] = useState("login");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();

        setError("");

        if (mode === "register" && !name.trim()) {
            setError("Please enter your name");
            return;
        }

        if (!email || !password) {
            setError("Please fill all required fields");
            return;
        }

        setLoading(true);

        try {
            const endpoint =
                mode === "login"
                    ? "/auth/login"
                    : "/auth/register";

            const body =
                mode === "login"
                    ? {
                        email,
                        password
                    }
                    : {
                        name,
                        email,
                        password
                    };

            const response = await fetch(
                `${API}${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Something went wrong"
                );
            }

            localStorage.setItem(
                "expense_token",
                data.token
            );

            localStorage.setItem(
                "expense_user",
                JSON.stringify(data.user)
            );

            onLogin(data.user);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-left">

                <div className="auth-brand">
                    <div className="brand-icon">₹</div>

                    <div>
                        <h2>Expense</h2>
                        <span>Tracker</span>
                    </div>
                </div>

                <div className="auth-hero">

                    <span className="auth-tag">
                        SMART FINANCE MANAGEMENT
                    </span>

                    <h1>
                        Take control of
                        <br />
                        <span>your money.</span>
                    </h1>

                    <p>
                        Track expenses, manage your budget,
                        and understand your financial habits
                        from one beautiful dashboard.
                    </p>

                    <div className="auth-features">
                        <div>
                            <span>✓</span>
                            Real-time financial overview
                        </div>

                        <div>
                            <span>✓</span>
                            Secure cloud storage
                        </div>

                        <div>
                            <span>✓</span>
                            Smart spending analytics
                        </div>
                    </div>

                </div>

            </div>


            <div className="auth-right">

                <div className="auth-card">

                    <div className="auth-mobile-brand">
                        <div className="brand-icon">₹</div>
                        <div>
                            <h2>Expense</h2>
                            <span>Tracker</span>
                        </div>
                    </div>

                    <div className="auth-heading">
                        <h2>
                            {mode === "login"
                                ? "Welcome back"
                                : "Create account"}
                        </h2>

                        <p>
                            {mode === "login"
                                ? "Sign in to continue to your dashboard"
                                : "Start managing your finances today"}
                        </p>
                    </div>

                    <form onSubmit={submit}>

                        {mode === "register" && (
                            <div className="input-group">
                                <label>Full Name</label>

                                <input
                                    type="text"
                                    placeholder="Harsh Kumar"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                />
                            </div>
                        )}

                        <div className="input-group">
                            <label>Email Address</label>

                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>

                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                            />
                        </div>

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        <button
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Please wait..."
                                : mode === "login"
                                    ? "Sign In"
                                    : "Create Account"}
                        </button>

                    </form>

                    <div className="auth-switch">

                        {mode === "login"
                            ? "Don't have an account?"
                            : "Already have an account?"}

                        <button
                            onClick={() => {
                                setMode(
                                    mode === "login"
                                        ? "register"
                                        : "login"
                                );

                                setError("");
                            }}
                        >
                            {mode === "login"
                                ? "Create one"
                                : "Sign in"}
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}


// =====================================================
// MAIN APP
// =====================================================

function App() {

    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("expense_user");

        return saved
            ? JSON.parse(saved)
            : null;
    });

    const [transactions, setTransactions] = useState([]);

    const [activePage, setActivePage] =
        useState("dashboard");

    const [darkMode, setDarkMode] =
        useState(false);

    const [showModal, setShowModal] =
        useState(false);

    const [editingTransaction, setEditingTransaction] =
        useState(null);

    const [toast, setToast] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [filterCategory, setFilterCategory] =
        useState("All");

    const [budget, setBudget] =
        useState(
            Number(
                localStorage.getItem(
                    "expense_budget"
                )
            ) || 10000
        );


    // =================================================
    // AUTH TOKEN
    // =================================================

    const token =
        localStorage.getItem("expense_token");


    // =================================================
    // TOAST
    // =================================================

    const showToast = (message) => {
        setToast(message);

        setTimeout(() => {
            setToast("");
        }, 2500);
    };


    // =================================================
    // FETCH TRANSACTIONS
    // =================================================

    const fetchTransactions = async () => {

        const currentToken =
            localStorage.getItem("expense_token");

        if (!currentToken) return;

        try {

            const response = await fetch(
                `${API}/transactions`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${currentToken}`
                    }
                }
            );

            if (response.status === 401) {
                logout();
                return;
            }

            const data = await response.json();

            setTransactions(
                data.transactions || []
            );

        } catch (error) {

            console.error(
                "Transaction fetch error:",
                error
            );

        }
    };


    useEffect(() => {

        if (user) {
            fetchTransactions();
        }

    }, [user]);


    // =================================================
    // LOGOUT
    // =================================================

    const logout = () => {

        localStorage.removeItem(
            "expense_token"
        );

        localStorage.removeItem(
            "expense_user"
        );

        setUser(null);
        setTransactions([]);

        setActivePage("dashboard");
    };


    // =================================================
    // ADD / UPDATE TRANSACTION
    // =================================================

    const saveTransaction = async (formData) => {

        const currentToken =
            localStorage.getItem("expense_token");

        try {

            const isEditing =
                Boolean(editingTransaction);

            const url = isEditing
                ? `${API}/transactions/${editingTransaction._id}`
                : `${API}/transactions/add`;

            const response = await fetch(
                url,
                {
                    method: isEditing
                        ? "PUT"
                        : "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${currentToken}`
                    },

                    body: JSON.stringify({
                        title: formData.title,
                        amount: Number(
                            formData.amount
                        ),
                        type: formData.type,
                        category:
                            formData.category,
                        date: formData.date
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to save transaction"
                );
            }

            await fetchTransactions();

            setShowModal(false);
            setEditingTransaction(null);

            showToast(
                isEditing
                    ? "Transaction updated successfully"
                    : "Transaction added successfully"
            );

        } catch (error) {

            showToast(error.message);

        }
    };


    // =================================================
    // DELETE
    // =================================================

    const deleteTransaction = async (id) => {

        const currentToken =
            localStorage.getItem("expense_token");

        if (
            !window.confirm(
                "Are you sure you want to delete this transaction?"
            )
        ) {
            return;
        }

        try {

            const response = await fetch(
                `${API}/transactions/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            `Bearer ${currentToken}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to delete transaction"
                );
            }

            await fetchTransactions();

            showToast(
                "Transaction deleted successfully"
            );

        } catch (error) {

            showToast(error.message);

        }
    };


    // =================================================
    // CALCULATIONS
    // =================================================

    const totalIncome = useMemo(() => {

        return transactions
            .filter(
                (item) =>
                    item.type === "income"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount),
                0
            );

    }, [transactions]);


    const totalExpense = useMemo(() => {

        return transactions
            .filter(
                (item) =>
                    item.type === "expense"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount),
                0
            );

    }, [transactions]);


    const balance =
        totalIncome - totalExpense;


    const savingsRate =
        totalIncome > 0
            ? Math.round(
                (balance / totalIncome) * 100
            )
            : 0;


    const budgetUsed =
        budget > 0
            ? Math.min(
                (totalExpense / budget) * 100,
                100
            )
            : 0;


    // =================================================
    // FILTER
    // =================================================

    const filteredTransactions =
        transactions.filter((transaction) => {

            const searchMatch =
                transaction.title
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );

            const categoryMatch =
                filterCategory === "All" ||
                transaction.category ===
                filterCategory;

            return (
                searchMatch &&
                categoryMatch
            );
        });


    // =================================================
    // CATEGORY ANALYTICS
    // =================================================

    const categoryTotals = categories
        .map((category) => {

            const total =
                transactions
                    .filter(
                        (item) =>
                            item.type === "expense" &&
                            item.category === category
                    )
                    .reduce(
                        (sum, item) =>
                            sum + Number(item.amount),
                        0
                    );

            return {
                category,
                total
            };

        })
        .filter((item) => item.total > 0)
        .sort(
            (a, b) =>
                b.total - a.total
        );


    // =================================================
    // MONTHLY CHART
    // =================================================

    const monthlyData = Array.from(
        { length: 6 },
        (_, index) => {

            const date = new Date();

            date.setMonth(
                date.getMonth() - (5 - index)
            );

            const month =
                date.toLocaleString(
                    "en-US",
                    {
                        month: "short"
                    }
                );

            const monthNumber =
                date.getMonth();

            const year =
                date.getFullYear();

            const income =
                transactions
                    .filter((item) => {

                        const d =
                            new Date(item.date);

                        return (
                            item.type === "income" &&
                            d.getMonth() ===
                            monthNumber &&
                            d.getFullYear() ===
                            year
                        );

                    })
                    .reduce(
                        (sum, item) =>
                            sum + Number(item.amount),
                        0
                    );

            const expense =
                transactions
                    .filter((item) => {

                        const d =
                            new Date(item.date);

                        return (
                            item.type === "expense" &&
                            d.getMonth() ===
                            monthNumber &&
                            d.getFullYear() ===
                            year
                        );

                    })
                    .reduce(
                        (sum, item) =>
                            sum + Number(item.amount),
                        0
                    );

            return {
                month,
                income,
                expense
            };
        }
    );


    // =================================================
    // NOT LOGGED IN
    // =================================================

    if (!user) {
        return (
            <AuthScreen
                onLogin={(loggedUser) =>
                    setUser(loggedUser)
                }
            />
        );
    }


    // =================================================
    // MAIN UI
    // =================================================

    return (
        <div
            className={
                darkMode
                    ? "app dark"
                    : "app"
            }
        >

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="brand">

                    <div className="brand-icon">
                        ₹
                    </div>

                    <div>
                        <h2>Expense</h2>
                        <span>Tracker</span>
                    </div>

                </div>


                <div className="menu-label">
                    MAIN MENU
                </div>


                <nav>

                    <button
                        className={
                            activePage === "dashboard"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            setActivePage(
                                "dashboard"
                            )
                        }
                    >
                        <span>▦</span>
                        Dashboard
                    </button>


                    <button
                        className={
                            activePage === "transactions"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            setActivePage(
                                "transactions"
                            )
                        }
                    >
                        <span>▤</span>
                        Transactions
                    </button>


                    <button
                        className={
                            activePage === "reports"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            setActivePage(
                                "reports"
                            )
                        }
                    >
                        <span>◩</span>
                        Reports
                    </button>


                    <button
                        className={
                            activePage === "settings"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            setActivePage(
                                "settings"
                            )
                        }
                    >
                        <span>⚙</span>
                        Settings
                    </button>

                </nav>


                {/* BUDGET */}

                <div className="sidebar-budget">

                    <div className="budget-title">
                        Monthly Budget
                        <span>🎯</span>
                    </div>

                    <strong>
                        ₹{totalExpense.toLocaleString()}
                    </strong>

                    <div className="progress">
                        <div
                            style={{
                                width:
                                    `${budgetUsed}%`
                            }}
                        />
                    </div>

                    <small>
                        ₹
                        {Math.max(
                            budget - totalExpense,
                            0
                        ).toLocaleString()}
                        {" "}remaining
                    </small>

                </div>


                {/* USER */}

                <div className="sidebar-user">

                    <div className="avatar">
                        {user.name
                            ?.charAt(0)
                            .toUpperCase()}
                    </div>

                    <div>
                        <strong>
                            {user.name}
                        </strong>

                        <small>
                            Student
                        </small>
                    </div>

                </div>

            </aside>


            {/* MAIN */}

            <main className="main">

                {/* TOPBAR */}

                <header className="topbar">

                    <div className="mobile-title">
                        Expense Tracker
                    </div>

                    <div className="top-actions">

                        <button
                            className="icon-button"
                            onClick={() =>
                                setDarkMode(
                                    !darkMode
                                )
                            }
                        >
                            {darkMode
                                ? "☀️"
                                : "🌙"}
                        </button>

                        <button className="icon-button">
                            🔔
                        </button>

                        <div className="top-user">

                            <div className="avatar small">
                                {user.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <strong>
                                    {user.name}
                                </strong>

                                <small>
                                    Student
                                </small>
                            </div>

                        </div>

                    </div>

                </header>


                {/* CONTENT */}

                <section className="content">


                    {/* ===================================
                        DASHBOARD
                    =================================== */}

                    {activePage === "dashboard" && (
                        <>

                            <div className="page-heading">

                                <div>
                                    <span>
                                        OVERVIEW
                                    </span>

                                    <h1>
                                        Financial Dashboard
                                    </h1>

                                    <p>
                                        Track your money,
                                        control your spending
                                        and reach your goals.
                                    </p>
                                </div>

                                <button
                                    className="primary-button"
                                    onClick={() => {
                                        setEditingTransaction(
                                            null
                                        );
                                        setShowModal(true);
                                    }}
                                >
                                    + Add Transaction
                                </button>

                            </div>


                            {/* STATS */}

                            <div className="stats-grid">

                                <StatCard
                                    icon="₹"
                                    title="TOTAL BALANCE"
                                    value={
                                        balance
                                    }
                                    note={
                                        `${savingsRate}% savings rate`
                                    }
                                    type="balance"
                                />

                                <StatCard
                                    icon="↗"
                                    title="TOTAL INCOME"
                                    value={
                                        totalIncome
                                    }
                                    note="Money received"
                                    type="income"
                                />

                                <StatCard
                                    icon="↘"
                                    title="TOTAL EXPENSE"
                                    value={
                                        totalExpense
                                    }
                                    note="Money spent"
                                    type="expense"
                                />

                                <StatCard
                                    icon="%"
                                    title="SAVINGS RATE"
                                    value={`${savingsRate}%`}
                                    note="Of total income"
                                    type="saving"
                                    raw
                                />

                            </div>


                            {/* CHART + BUDGET */}

                            <div className="two-column">

                                <div className="panel chart-panel">

                                    <div className="panel-header">

                                        <div>
                                            <h3>
                                                Income vs Expense
                                            </h3>

                                            <p>
                                                Overall financial comparison
                                            </p>
                                        </div>

                                        <span className="year-badge">
                                            2026
                                        </span>

                                    </div>


                                    <div className="bar-chart">

                                        {monthlyData.map(
                                            (item, index) => {

                                                const max =
                                                    Math.max(
                                                        item.income,
                                                        item.expense,
                                                        1
                                                    );

                                                return (
                                                    <div
                                                        className="chart-column"
                                                        key={index}
                                                    >

                                                        <div className="bars">

                                                            <div
                                                                className="bar income"
                                                                style={{
                                                                    height:
                                                                        `${Math.max(
                                                                            (item.income /
                                                                                max) *
                                                                            100,
                                                                            5
                                                                        )}%`
                                                                }}
                                                            />

                                                            <div
                                                                className="bar expense"
                                                                style={{
                                                                    height:
                                                                        `${Math.max(
                                                                            (item.expense /
                                                                                max) *
                                                                            100,
                                                                            5
                                                                        )}%`
                                                                }}
                                                            />

                                                        </div>

                                                        <span>
                                                            {item.month}
                                                        </span>

                                                    </div>
                                                );
                                            }
                                        )}

                                    </div>

                                    <div className="legend">

                                        <span>
                                            <i className="dot income-dot" />
                                            Income
                                        </span>

                                        <span>
                                            <i className="dot expense-dot" />
                                            Expense
                                        </span>

                                    </div>

                                </div>


                                <div className="panel">

                                    <div className="panel-header">

                                        <div>
                                            <h3>
                                                Monthly Budget
                                            </h3>

                                            <p>
                                                Your spending limit
                                            </p>
                                        </div>

                                        <span className="target">
                                            🎯
                                        </span>

                                    </div>

                                    <div className="budget-number">

                                        ₹
                                        {totalExpense.toLocaleString()}

                                        <small>
                                            /
                                            ₹
                                            {budget.toLocaleString()}
                                        </small>

                                    </div>

                                    <div className="large-progress">

                                        <div
                                            style={{
                                                width:
                                                    `${budgetUsed}%`
                                            }}
                                        />

                                    </div>

                                    <div className="budget-info">

                                        <span>
                                            {Math.round(
                                                budgetUsed
                                            )}% used
                                        </span>

                                        <strong>
                                            ₹
                                            {Math.max(
                                                budget -
                                                totalExpense,
                                                0
                                            ).toLocaleString()}
                                            {" "}left
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* RECENT */}

                            <div className="panel recent-panel">

                                <div className="panel-header">

                                    <div>
                                        <h3>
                                            Recent Transactions
                                        </h3>

                                        <p>
                                            Your latest financial activity
                                        </p>
                                    </div>

                                    <button
                                        className="text-button"
                                        onClick={() =>
                                            setActivePage(
                                                "transactions"
                                            )
                                        }
                                    >
                                        View all →
                                    </button>

                                </div>


                                <TransactionList
                                    transactions={
                                        transactions.slice(
                                            0,
                                            5
                                        )
                                    }
                                    onEdit={(item) => {
                                        setEditingTransaction(
                                            item
                                        );
                                        setShowModal(true);
                                    }}
                                    onDelete={
                                        deleteTransaction
                                    }
                                />

                            </div>

                        </>
                    )}


                    {/* ===================================
                        TRANSACTIONS
                    =================================== */}

                    {activePage === "transactions" && (
                        <>

                            <div className="page-heading">

                                <div>
                                    <span>
                                        MONEY ACTIVITY
                                    </span>

                                    <h1>
                                        Transactions
                                    </h1>

                                    <p>
                                        Manage all your income
                                        and expenses.
                                    </p>
                                </div>

                                <button
                                    className="primary-button"
                                    onClick={() => {
                                        setEditingTransaction(
                                            null
                                        );
                                        setShowModal(true);
                                    }}
                                >
                                    + Add Transaction
                                </button>

                            </div>


                            <div className="panel">

                                <div className="filters">

                                    <input
                                        className="search-input"
                                        placeholder="Search transactions..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <select
                                        value={
                                            filterCategory
                                        }
                                        onChange={(e) =>
                                            setFilterCategory(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="All">
                                            All Categories
                                        </option>

                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={
                                                        category
                                                    }
                                                    value={
                                                        category
                                                    }
                                                >
                                                    {category}
                                                </option>
                                            )
                                        )}
                                    </select>

                                </div>


                                <TransactionList
                                    transactions={
                                        filteredTransactions
                                    }
                                    onEdit={(item) => {
                                        setEditingTransaction(
                                            item
                                        );
                                        setShowModal(true);
                                    }}
                                    onDelete={
                                        deleteTransaction
                                    }
                                />

                            </div>

                        </>
                    )}


                    {/* ===================================
                        REPORTS
                    =================================== */}

                    {activePage === "reports" && (
                        <>

                            <div className="page-heading">

                                <div>
                                    <span>
                                        ANALYTICS
                                    </span>

                                    <h1>
                                        Financial Reports
                                    </h1>

                                    <p>
                                        Understand where your
                                        money is going.
                                    </p>
                                </div>

                            </div>


                            <div className="reports-grid">

                                <div className="panel">

                                    <div className="panel-header">
                                        <div>
                                            <h3>
                                                Spending by Category
                                            </h3>

                                            <p>
                                                Expense distribution
                                            </p>
                                        </div>
                                    </div>

                                    {categoryTotals.length === 0 ? (
                                        <div className="empty-state">
                                            No expense data yet.
                                        </div>
                                    ) : (
                                        <div className="category-list">

                                            {categoryTotals.map(
                                                (item) => {

                                                    const percentage =
                                                        totalExpense >
                                                            0
                                                            ? (
                                                                item.total /
                                                                totalExpense
                                                            ) *
                                                            100
                                                            : 0;

                                                    return (
                                                        <div
                                                            className="category-row"
                                                            key={
                                                                item.category
                                                            }
                                                        >

                                                            <div>
                                                                <span>
                                                                    {
                                                                        item.category
                                                                    }
                                                                </span>

                                                                <strong>
                                                                    ₹
                                                                    {item.total.toLocaleString()}
                                                                </strong>
                                                            </div>

                                                            <div className="category-progress">
                                                                <div
                                                                    style={{
                                                                        width:
                                                                            `${percentage}%`
                                                                    }}
                                                                />
                                                            </div>

                                                            <small>
                                                                {Math.round(
                                                                    percentage
                                                                )}%
                                                            </small>

                                                        </div>
                                                    );
                                                }
                                            )}

                                        </div>
                                    )}

                                </div>


                                <div className="panel report-summary">

                                    <h3>
                                        Financial Summary
                                    </h3>

                                    <div className="summary-line">
                                        <span>
                                            Income
                                        </span>

                                        <strong className="positive">
                                            +₹
                                            {totalIncome.toLocaleString()}
                                        </strong>
                                    </div>

                                    <div className="summary-line">
                                        <span>
                                            Expenses
                                        </span>

                                        <strong className="negative">
                                            -₹
                                            {totalExpense.toLocaleString()}
                                        </strong>
                                    </div>

                                    <div className="summary-line">
                                        <span>
                                            Balance
                                        </span>

                                        <strong>
                                            ₹
                                            {balance.toLocaleString()}
                                        </strong>
                                    </div>

                                    <div className="summary-line">
                                        <span>
                                            Transactions
                                        </span>

                                        <strong>
                                            {
                                                transactions.length
                                            }
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        </>
                    )}


                    {/* ===================================
                        SETTINGS
                    =================================== */}

                    {activePage === "settings" && (
                        <>

                            <div className="page-heading">

                                <div>
                                    <span>
                                        ACCOUNT
                                    </span>

                                    <h1>
                                        Settings
                                    </h1>

                                    <p>
                                        Manage your account
                                        preferences.
                                    </p>
                                </div>

                            </div>


                            <div className="settings-grid">

                                <div className="panel">

                                    <h3>
                                        Profile
                                    </h3>

                                    <div className="profile-box">

                                        <div className="avatar large">
                                            {user.name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div>
                                            <strong>
                                                {user.name}
                                            </strong>

                                            <p>
                                                {user.email}
                                            </p>
                                        </div>

                                    </div>

                                </div>


                                <div className="panel">

                                    <h3>
                                        Preferences
                                    </h3>

                                    <div className="setting-row">

                                        <div>
                                            <strong>
                                                Dark Mode
                                            </strong>

                                            <p>
                                                Change dashboard appearance
                                            </p>
                                        </div>

                                        <button
                                            className={
                                                darkMode
                                                    ? "toggle on"
                                                    : "toggle"
                                            }
                                            onClick={() =>
                                                setDarkMode(
                                                    !darkMode
                                                )
                                            }
                                        >
                                            <span />
                                        </button>

                                    </div>


                                    <div className="setting-row budget-setting">

                                        <div>
                                            <strong>
                                                Monthly Budget
                                            </strong>

                                            <p>
                                                Set your monthly spending limit
                                            </p>
                                        </div>

                                        <input
                                            type="number"
                                            value={budget}
                                            onChange={(e) => {

                                                const value =
                                                    Number(
                                                        e.target.value
                                                    );

                                                setBudget(
                                                    value
                                                );

                                                localStorage.setItem(
                                                    "expense_budget",
                                                    value
                                                );
                                            }}
                                        />

                                    </div>

                                </div>


                                <div className="panel logout-panel">

                                    <h3>
                                        Account
                                    </h3>

                                    <p>
                                        Sign out from your
                                        Expense Tracker account.
                                    </p>

                                    <button
                                        className="logout-button"
                                        onClick={
                                            logout
                                        }
                                    >
                                        Logout
                                    </button>

                                </div>

                            </div>

                        </>
                    )}

                </section>

            </main>


            {/* MODAL */}

            {showModal && (
                <TransactionModal
                    transaction={
                        editingTransaction
                    }
                    onClose={() => {
                        setShowModal(false);
                        setEditingTransaction(
                            null
                        );
                    }}
                    onSave={
                        saveTransaction
                    }
                />
            )}


            {/* TOAST */}

            {toast && (
                <div className="toast">
                    ✓ {toast}
                </div>
            )}

        </div>
    );
}


// =====================================================
// STAT CARD
// =====================================================

function StatCard({
    icon,
    title,
    value,
    note,
    type,
    raw
}) {

    return (
        <div className="stat-card">

            <div className={`stat-icon ${type}`}>
                {icon}
            </div>

            <span className="stat-title">
                {title}
            </span>

            <strong className="stat-value">
                {raw
                    ? value
                    : `₹${Number(
                        value
                    ).toLocaleString()}`}
            </strong>

            <small className={type}>
                {type === "expense"
                    ? "↓ "
                    : type === "income"
                        ? "↑ "
                        : ""}
                {note}
            </small>

        </div>
    );
}


// =====================================================
// TRANSACTION LIST
// =====================================================

function TransactionList({
    transactions,
    onEdit,
    onDelete
}) {

    if (!transactions.length) {

        return (
            <div className="empty-state">

                <div className="empty-icon">
                    ₹
                </div>

                <h3>
                    No transactions yet
                </h3>

                <p>
                    Add your first income or
                    expense to get started.
                </p>

            </div>
        );
    }


    return (
        <div className="transaction-list">

            {transactions.map(
                (transaction) => (

                    <div
                        className="transaction-row"
                        key={
                            transaction._id
                        }
                    >

                        <div className="transaction-icon">
                            {transaction.type ===
                                "income"
                                ? "↗"
                                : "↘"}
                        </div>


                        <div className="transaction-main">

                            <strong>
                                {
                                    transaction.title
                                }
                            </strong>

                            <span>
                                {
                                    transaction.category
                                }
                                {" • "}
                                {new Date(
                                    transaction.date
                                ).toLocaleDateString(
                                    "en-IN"
                                )}
                            </span>

                        </div>


                        <strong
                            className={
                                transaction.type ===
                                    "income"
                                    ? "amount positive"
                                    : "amount negative"
                            }
                        >
                            {transaction.type ===
                                "income"
                                ? "+"
                                : "-"}
                            ₹
                            {Number(
                                transaction.amount
                            ).toLocaleString()}
                        </strong>


                        <div className="row-actions">

                            <button
                                onClick={() =>
                                    onEdit(
                                        transaction
                                    )
                                }
                            >
                                ✎
                            </button>

                            <button
                                onClick={() =>
                                    onDelete(
                                        transaction._id
                                    )
                                }
                            >
                                🗑
                            </button>

                        </div>

                    </div>
                )
            )}

        </div>
    );
}


// =====================================================
// TRANSACTION MODAL
// =====================================================

function TransactionModal({
    transaction,
    onClose,
    onSave
}) {

    const [title, setTitle] =
        useState(
            transaction?.title || ""
        );

    const [amount, setAmount] =
        useState(
            transaction?.amount || ""
        );

    const [type, setType] =
        useState(
            transaction?.type || "expense"
        );

    const [category, setCategory] =
        useState(
            transaction?.category || "Food"
        );

    const [date, setDate] =
        useState(
            transaction
                ? new Date(
                    transaction.date
                )
                    .toISOString()
                    .split("T")[0]
                : new Date()
                    .toISOString()
                    .split("T")[0]
        );


    const submit = (e) => {

        e.preventDefault();

        if (
            !title ||
            !amount ||
            Number(amount) <= 0
        ) {
            alert(
                "Please enter valid transaction details"
            );

            return;
        }

        onSave({
            title,
            amount,
            type,
            category,
            date
        });
    };


    return (
        <div
            className="modal-overlay"
            onMouseDown={(e) => {

                if (
                    e.target ===
                    e.currentTarget
                ) {
                    onClose();
                }

            }}
        >

            <div className="modal">

                <div className="modal-header">

                    <div>
                        <span>
                            MONEY MANAGEMENT
                        </span>

                        <h2>
                            {transaction
                                ? "Edit Transaction"
                                : "Add Transaction"}
                        </h2>
                    </div>

                    <button
                        className="close-button"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>


                <form
                    className="transaction-form"
                    onSubmit={submit}
                >

                    <div className="type-selector">

                        <button
                            type="button"
                            className={
                                type === "expense"
                                    ? "selected expense"
                                    : ""
                            }
                            onClick={() =>
                                setType(
                                    "expense"
                                )
                            }
                        >
                            ↓ Expense
                        </button>

                        <button
                            type="button"
                            className={
                                type === "income"
                                    ? "selected income"
                                    : ""
                            }
                            onClick={() =>
                                setType(
                                    "income"
                                )
                            }
                        >
                            ↑ Income
                        </button>

                    </div>


                    <div className="form-grid">

                        <div className="input-group">
                            <label>
                                Title
                            </label>

                            <input
                                value={title}
                                onChange={(e) =>
                                    setTitle(
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. Grocery shopping"
                            />
                        </div>


                        <div className="input-group">
                            <label>
                                Amount
                            </label>

                            <input
                                type="number"
                                value={amount}
                                onChange={(e) =>
                                    setAmount(
                                        e.target.value
                                    )
                                }
                                placeholder="₹ 0"
                            />
                        </div>


                        <div className="input-group">

                            <label>
                                Category
                            </label>

                            <select
                                value={category}
                                onChange={(e) =>
                                    setCategory(
                                        e.target.value
                                    )
                                }
                            >

                                {categories.map(
                                    (item) => (
                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {item}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        <div className="input-group">

                            <label>
                                Date
                            </label>

                            <input
                                type="date"
                                value={date}
                                onChange={(e) =>
                                    setDate(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>


                    <div className="modal-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                        >
                            {transaction
                                ? "Update Transaction"
                                : "Add Transaction"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


export default App;