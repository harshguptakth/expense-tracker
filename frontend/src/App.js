import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "https://expense-tracker-atq4.onrender.com/api";

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

            // Registration endpoint creates the account but does not return a JWT.
            // Log in immediately after a successful registration.
            if (mode === "register") {
                const loginResponse = await fetch(
                    `${API}/auth/login`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );

                const loginData = await loginResponse.json();

                if (!loginResponse.ok) {
                    throw new Error(
                        loginData.message ||
                        "Account created. Please log in."
                    );
                }

                localStorage.setItem(
                    "expense_token",
                    loginData.token
                );

                localStorage.setItem(
                    "expense_user",
                    JSON.stringify(loginData.user)
                );

                onLogin(loginData.user);
            } else {
                localStorage.setItem(
                    "expense_token",
                    data.token
                );

                localStorage.setItem(
                    "expense_user",
                    JSON.stringify(data.user)
                );

                onLogin(data.user);
            }

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
    // TOAST
    // =================================================

    const showToast = (message) => {
        setToast(message);

        setTimeout(() => {
            setToast("");
        }, 2500);
    };


    // =================================================
    // LOGOUT
    // =================================================

    const logout = useCallback(() => {
        localStorage.removeItem("expense_token");
        localStorage.removeItem("expense_user");

        setUser(null);
        setTransactions([]);
        setActivePage("dashboard");
    }, []);


    // =================================================
    // FETCH TRANSACTIONS
    // =================================================

    const fetchTransactions = useCallback(async () => {
        const currentToken =
            localStorage.getItem("expense_token");

        const savedUser =
            localStorage.getItem("expense_user");

        if (!currentToken || !savedUser) return;

        let currentUser;

        try {
            currentUser = JSON.parse(savedUser);
        } catch (error) {
            logout();
            return;
        }

        if (!currentUser?.id) {
            logout();
            return;
        }

        try {
            const response = await fetch(
                `${API}/transactions/${currentUser.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${currentToken}`
                    }
                }
            );

            if (response.status === 401) {
                logout();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to fetch transactions"
                );
            }

            setTransactions(data.transactions || []);
        } catch (error) {
            console.error(
                "Transaction fetch error:",
                error
            );
        }
    }, [logout]);


    useEffect(() => {
        if (user?.id) {
            fetchTransactions();
        }
    }, [user?.id, fetchTransactions]);


    // =================================================
    // CALCULATIONS
    // =================================================

    const totalIncome = useMemo(() => {
        return transactions
            .filter(
                (transaction) =>
                    transaction.type === "income"
            )
            .reduce(
                (sum, transaction) =>
                    sum + Number(transaction.amount),
                0
            );
    }, [transactions]);


    const totalExpense = useMemo(() => {
        return transactions
            .filter(
                (transaction) =>
                    transaction.type === "expense"
            )
            .reduce(
                (sum, transaction) =>
                    sum + Number(transaction.amount),
                0
            );
    }, [transactions]);


    const balance = totalIncome - totalExpense;


    const savingsRate =
        totalIncome > 0
            ? Math.round(
                ((totalIncome - totalExpense) /
                    totalIncome) *
                100
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
    // FILTERED TRANSACTIONS
    // =================================================

    const filteredTransactions = useMemo(() => {
        return transactions.filter((transaction) => {

            const matchesSearch =
                transaction.title
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                transaction.category
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            const matchesCategory =
                filterCategory === "All" ||
                transaction.category === filterCategory;

            return (
                matchesSearch &&
                matchesCategory
            );
        });
    }, [
        transactions,
        search,
        filterCategory
    ]);


    // =================================================
    // CATEGORY ANALYTICS
    // =================================================

    const categoryData = useMemo(() => {

        const data = {};

        transactions
            .filter(
                (transaction) =>
                    transaction.type === "expense"
            )
            .forEach((transaction) => {

                const category =
                    transaction.category || "Other";

                data[category] =
                    (data[category] || 0) +
                    Number(transaction.amount);
            });

        return Object.entries(data)
            .sort((a, b) => b[1] - a[1]);

    }, [transactions]);


    // =================================================
    // MONTHLY DATA
    // =================================================

    const monthlyData = useMemo(() => {

        const months = {};

        transactions.forEach((transaction) => {

            const date =
                new Date(transaction.date);

            const key =
                date.toLocaleString(
                    "default",
                    {
                        month: "short"
                    }
                );

            if (!months[key]) {
                months[key] = {
                    income: 0,
                    expense: 0
                };
            }

            if (transaction.type === "income") {
                months[key].income +=
                    Number(transaction.amount);
            } else {
                months[key].expense +=
                    Number(transaction.amount);
            }
        });

        return Object.entries(months);

    }, [transactions]);


    // =================================================
    // ADD TRANSACTION
    // =================================================

    const addTransaction = async (transactionData) => {

        const token =
            localStorage.getItem(
                "expense_token"
            );

        if (!user?.id) return;

        try {

            const response = await fetch(
                `${API}/transactions/add`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...transactionData,
                        userId: user.id
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to add transaction"
                );
            }

            setTransactions((prev) => [
                data.transaction,
                ...prev
            ]);

            setShowModal(false);

            showToast(
                "Transaction added successfully"
            );

        } catch (error) {

            console.error(error);

            showToast(
                error.message ||
                "Something went wrong"
            );
        }
    };


    // =================================================
    // UPDATE TRANSACTION
    // =================================================

    const updateTransaction =
        async (id, transactionData) => {

            const token =
                localStorage.getItem(
                    "expense_token"
                );

            try {

                const response = await fetch(
                    `${API}/transactions/${id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`
                        },
                        body:
                            JSON.stringify(
                                transactionData
                            )
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Unable to update transaction"
                    );
                }

                setTransactions((prev) =>
                    prev.map((transaction) =>
                        transaction._id === id
                            ? data.transaction
                            : transaction
                    )
                );

                setShowModal(false);
                setEditingTransaction(null);

                showToast(
                    "Transaction updated successfully"
                );

            } catch (error) {

                console.error(error);

                showToast(
                    error.message ||
                    "Something went wrong"
                );
            }
        };


    // =================================================
    // DELETE TRANSACTION
    // =================================================

    const deleteTransaction =
        async (id) => {

            const token =
                localStorage.getItem(
                    "expense_token"
                );

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this transaction?"
                );

            if (!confirmed) return;

            try {

                const response = await fetch(
                    `${API}/transactions/${id}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Unable to delete transaction"
                    );
                }

                setTransactions((prev) =>
                    prev.filter(
                        (transaction) =>
                            transaction._id !== id
                    )
                );

                showToast(
                    "Transaction deleted successfully"
                );

            } catch (error) {

                console.error(error);

                showToast(
                    error.message ||
                    "Something went wrong"
                );
            }
        };


    // =================================================
    // BUDGET
    // =================================================

    const updateBudget = (value) => {

        const newBudget =
            Number(value) || 0;

        setBudget(newBudget);

        localStorage.setItem(
            "expense_budget",
            newBudget
        );

        showToast(
            "Monthly budget updated"
        );
    };


    // =================================================
    // OPEN EDIT MODAL
    // =================================================

    const openEditModal =
        (transaction) => {

            setEditingTransaction(
                transaction
            );

            setShowModal(true);
        };


    // =================================================
    // OPEN ADD MODAL
    // =================================================

    const openAddModal = () => {

        setEditingTransaction(null);

        setShowModal(true);
    };


    // =================================================
    // IF USER IS NOT LOGGED IN
    // =================================================

    if (!user) {
        return (
            <AuthScreen
                onLogin={(loggedInUser) =>
                    setUser(loggedInUser)
                }
            />
        );
    }


    // =================================================
    // SIDEBAR
    // =================================================

    const navItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: "⌂"
        },
        {
            id: "transactions",
            label: "Transactions",
            icon: "↔"
        },
        {
            id: "reports",
            label: "Reports",
            icon: "◔"
        },
        {
            id: "settings",
            label: "Settings",
            icon: "⚙"
        }
    ];


    return (
        <div
            className={
                darkMode
                    ? "app dark-mode"
                    : "app"
            }
        >

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="sidebar-brand">

                    <div className="brand-icon">
                        ₹
                    </div>

                    <div>
                        <h2>Expense</h2>
                        <span>Tracker</span>
                    </div>

                </div>


                <nav className="sidebar-nav">

                    <div className="nav-section-title">
                        MAIN MENU
                    </div>

                    {navItems.map((item) => (

                        <button
                            key={item.id}
                            className={
                                activePage === item.id
                                    ? "nav-item active"
                                    : "nav-item"
                            }
                            onClick={() =>
                                setActivePage(item.id)
                            }
                        >

                            <span className="nav-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.label}
                            </span>

                        </button>

                    ))}

                </nav>


                <div className="sidebar-bottom">

                    <button
                        className="theme-toggle"
                        onClick={() =>
                            setDarkMode(
                                (prev) => !prev
                            )
                        }
                    >
                        <span>
                            {darkMode
                                ? "☀"
                                : "☾"}
                        </span>

                        {darkMode
                            ? "Light Mode"
                            : "Dark Mode"}
                    </button>


                    <button
                        className="logout-button"
                        onClick={logout}
                    >
                        <span>↪</span>
                        Logout
                    </button>


                    <div className="sidebar-user">

                        <div className="user-avatar">
                            {user.name
                                ?.charAt(0)
                                ?.toUpperCase()}
                        </div>

                        <div className="user-info">

                            <strong>
                                {user.name}
                            </strong>

                            <span>
                                {user.email}
                            </span>

                        </div>

                    </div>

                </div>

            </aside>


            {/* MAIN CONTENT */}

            <main className="main-content">

                <header className="topbar">

                    <div>

                        <h1>
                            {activePage === "dashboard"
                                ? "Dashboard"
                                : activePage ===
                                    "transactions"
                                    ? "Transactions"
                                    : activePage ===
                                        "reports"
                                        ? "Reports"
                                        : "Settings"}
                        </h1>

                        <p>
                            Welcome back,{" "}
                            {user.name?.split(" ")[0]} 👋
                        </p>

                    </div>


                    <div className="topbar-actions">

                        <div className="search-box">

                            <span>⌕</span>

                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <button
                            className="top-add-button"
                            onClick={openAddModal}
                        >
                            + Add Transaction
                        </button>

                    </div>

                </header>


                {/* DASHBOARD */}

                {activePage === "dashboard" && (

                    <div className="dashboard-page">

                        <div className="stats-grid">

                            <div className="stat-card income-card">

                                <div className="stat-card-top">

                                    <span>
                                        Total Income
                                    </span>

                                    <div className="stat-icon income">
                                        ↗
                                    </div>

                                </div>

                                <h2>
                                    ₹
                                    {totalIncome.toLocaleString(
                                        "en-IN"
                                    )}
                                </h2>

                                <small>
                                    All-time income
                                </small>

                            </div>


                            <div className="stat-card expense-card">

                                <div className="stat-card-top">

                                    <span>
                                        Total Expenses
                                    </span>

                                    <div className="stat-icon expense">
                                        ↘
                                    </div>

                                </div>

                                <h2>
                                    ₹
                                    {totalExpense.toLocaleString(
                                        "en-IN"
                                    )}
                                </h2>

                                <small>
                                    All-time spending
                                </small>

                            </div>


                            <div className="stat-card balance-card">

                                <div className="stat-card-top">

                                    <span>
                                        Current Balance
                                    </span>

                                    <div className="stat-icon balance">
                                        ₹
                                    </div>

                                </div>

                                <h2>
                                    ₹
                                    {balance.toLocaleString(
                                        "en-IN"
                                    )}
                                </h2>

                                <small>
                                    Available balance
                                </small>

                            </div>


                            <div className="stat-card savings-card">

                                <div className="stat-card-top">

                                    <span>
                                        Savings Rate
                                    </span>

                                    <div className="stat-icon savings">
                                        %
                                    </div>

                                </div>

                                <h2>
                                    {savingsRate}%
                                </h2>

                                <small>
                                    Income saved
                                </small>

                            </div>

                        </div>
                                                {/* BUDGET CARD */}

                        <div className="dashboard-grid">

                            <div className="budget-card">

                                <div className="section-header">

                                    <div>
                                        <h3>Monthly Budget</h3>
                                        <p>
                                            Keep your spending
                                            under control
                                        </p>
                                    </div>

                                    <button
                                        className="small-action"
                                        onClick={() => {
                                            const value =
                                                window.prompt(
                                                    "Enter monthly budget:",
                                                    budget
                                                );

                                            if (
                                                value !== null &&
                                                value !== ""
                                            ) {
                                                updateBudget(
                                                    value
                                                );
                                            }
                                        }}
                                    >
                                        Edit
                                    </button>

                                </div>


                                <div className="budget-amount">

                                    <div>

                                        <span>
                                            Spent
                                        </span>

                                        <strong>
                                            ₹
                                            {totalExpense.toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>

                                    </div>


                                    <div className="budget-limit">

                                        <span>
                                            Budget
                                        </span>

                                        <strong>
                                            ₹
                                            {budget.toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>

                                    </div>

                                </div>


                                <div className="progress-container">

                                    <div className="progress-track">

                                        <div
                                            className="progress-fill"
                                            style={{
                                                width:
                                                    `${budgetUsed}%`
                                            }}
                                        />

                                    </div>

                                    <span>
                                        {Math.round(
                                            budgetUsed
                                        )}%
                                    </span>

                                </div>


                                <p className="budget-message">

                                    {totalExpense > budget
                                        ? "⚠ You have exceeded your monthly budget."
                                        : `₹${Math.max(
                                            budget -
                                            totalExpense,
                                            0
                                        ).toLocaleString(
                                            "en-IN"
                                        )} remaining this month`}

                                </p>

                            </div>


                            {/* QUICK ACTION */}

                            <div className="quick-action-card">

                                <div className="section-header">

                                    <div>
                                        <h3>Quick Actions</h3>
                                        <p>
                                            Manage your finances
                                        </p>
                                    </div>

                                </div>


                                <div className="quick-actions">

                                    <button
                                        onClick={openAddModal}
                                        className="quick-action"
                                    >

                                        <div className="quick-icon add">
                                            +
                                        </div>

                                        <div>
                                            <strong>
                                                Add Transaction
                                            </strong>

                                            <span>
                                                Record income
                                                or expense
                                            </span>
                                        </div>

                                    </button>


                                    <button
                                        onClick={() =>
                                            setActivePage(
                                                "transactions"
                                            )
                                        }
                                        className="quick-action"
                                    >

                                        <div className="quick-icon view">
                                            ↔
                                        </div>

                                        <div>
                                            <strong>
                                                View Transactions
                                            </strong>

                                            <span>
                                                See your
                                                transaction history
                                            </span>
                                        </div>

                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* ANALYTICS */}

                        <div className="analytics-grid">

                            {/* CATEGORY ANALYTICS */}

                            <div className="analytics-card">

                                <div className="section-header">

                                    <div>
                                        <h3>
                                            Expense by Category
                                        </h3>

                                        <p>
                                            Where your money
                                            is going
                                        </p>
                                    </div>

                                    <button
                                        className="view-all"
                                        onClick={() =>
                                            setActivePage(
                                                "reports"
                                            )
                                        }
                                    >
                                        View Report →
                                    </button>

                                </div>


                                {categoryData.length === 0 ? (

                                    <div className="empty-chart">

                                        <div className="empty-icon">
                                            ◔
                                        </div>

                                        <p>
                                            No expense data
                                            available yet
                                        </p>

                                        <button
                                            onClick={
                                                openAddModal
                                            }
                                        >
                                            Add your first
                                            expense
                                        </button>

                                    </div>

                                ) : (

                                    <div className="category-list">

                                        {categoryData
                                            .slice(0, 6)
                                            .map(
                                                (
                                                    [category, amount],
                                                    index
                                                ) => {

                                                    const percentage =
                                                        totalExpense >
                                                            0
                                                            ? (
                                                                (amount /
                                                                    totalExpense) *
                                                                100
                                                            )
                                                            : 0;

                                                    return (

                                                        <div
                                                            className="category-row"
                                                            key={
                                                                category
                                                            }
                                                        >

                                                            <div className="category-info">

                                                                <div
                                                                    className={`category-dot dot-${index}`}
                                                                />

                                                                <span>
                                                                    {
                                                                        category
                                                                    }
                                                                </span>

                                                            </div>


                                                            <div className="category-progress">

                                                                <div className="category-track">

                                                                    <div
                                                                        className="category-fill"
                                                                        style={{
                                                                            width:
                                                                                `${percentage}%`
                                                                        }}
                                                                    />

                                                                </div>

                                                            </div>


                                                            <div className="category-value">

                                                                <strong>
                                                                    ₹
                                                                    {amount.toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </strong>

                                                                <span>
                                                                    {Math.round(
                                                                        percentage
                                                                    )}
                                                                    %
                                                                </span>

                                                            </div>

                                                        </div>

                                                    );
                                                }
                                            )}

                                    </div>

                                )}

                            </div>


                            {/* INCOME VS EXPENSE */}

                            <div className="analytics-card">

                                <div className="section-header">

                                    <div>
                                        <h3>
                                            Income vs Expenses
                                        </h3>

                                        <p>
                                            Financial overview
                                        </p>
                                    </div>

                                    <span className="period-label">
                                        All time
                                    </span>

                                </div>


                                <div className="comparison-chart">

                                    <div className="comparison-item">

                                        <div className="comparison-label">

                                            <span className="income-dot" />

                                            <span>
                                                Income
                                            </span>

                                        </div>

                                        <strong>
                                            ₹
                                            {totalIncome.toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>

                                    </div>


                                    <div className="comparison-bar">

                                        <div
                                            className="income-bar"
                                            style={{
                                                width:
                                                    totalIncome +
                                                        totalExpense >
                                                        0
                                                        ? `${(
                                                            totalIncome /
                                                            (
                                                                totalIncome +
                                                                totalExpense
                                                            )
                                                        ) *
                                                        100
                                                        }%`
                                                        : "0%"
                                            }}
                                        />

                                    </div>


                                    <div className="comparison-item">

                                        <div className="comparison-label">

                                            <span className="expense-dot" />

                                            <span>
                                                Expenses
                                            </span>

                                        </div>

                                        <strong>
                                            ₹
                                            {totalExpense.toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>

                                    </div>


                                    <div className="comparison-bar">

                                        <div
                                            className="expense-bar"
                                            style={{
                                                width:
                                                    totalIncome +
                                                        totalExpense >
                                                        0
                                                        ? `${(
                                                            totalExpense /
                                                            (
                                                                totalIncome +
                                                                totalExpense
                                                            )
                                                        ) *
                                                        100
                                                        }%`
                                                        : "0%"
                                            }}
                                        />

                                    </div>


                                    <div className="net-result">

                                        <span>
                                            Net Balance
                                        </span>

                                        <strong
                                            className={
                                                balance >= 0
                                                    ? "positive"
                                                    : "negative"
                                            }
                                        >
                                            ₹
                                            {balance.toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* RECENT TRANSACTIONS */}

                        <div className="recent-section">

                            <div className="section-header">

                                <div>
                                    <h3>
                                        Recent Transactions
                                    </h3>

                                    <p>
                                        Your latest financial
                                        activity
                                    </p>
                                </div>

                                <button
                                    className="view-all"
                                    onClick={() =>
                                        setActivePage(
                                            "transactions"
                                        )
                                    }
                                >
                                    View All →
                                </button>

                            </div>


                            {transactions.length === 0 ? (

                                <div className="empty-state">

                                    <div className="empty-state-icon">
                                        ₹
                                    </div>

                                    <h3>
                                        No transactions yet
                                    </h3>

                                    <p>
                                        Start tracking your
                                        finances by adding
                                        your first transaction.
                                    </p>

                                    <button
                                        className="primary-button"
                                        onClick={
                                            openAddModal
                                        }
                                    >
                                        + Add Transaction
                                    </button>

                                </div>

                            ) : (

                                <div className="transaction-table">

                                    <div className="table-header">

                                        <span>
                                            Transaction
                                        </span>

                                        <span>
                                            Category
                                        </span>

                                        <span>
                                            Date
                                        </span>

                                        <span>
                                            Amount
                                        </span>

                                        <span>
                                            Action
                                        </span>

                                    </div>


                                    {transactions
                                        .slice(0, 5)
                                        .map(
                                            (
                                                transaction
                                            ) => (

                                                <div
                                                    className="table-row"
                                                    key={
                                                        transaction._id
                                                    }
                                                >

                                                    <div className="transaction-name">

                                                        <div
                                                            className={
                                                                transaction.type ===
                                                                    "income"
                                                                    ? "transaction-icon income"
                                                                    : "transaction-icon expense"
                                                            }
                                                        >
                                                            {transaction.type ===
                                                                "income"
                                                                ? "↗"
                                                                : "↘"}
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    transaction.title
                                                                }
                                                            </strong>

                                                            <small>
                                                                {transaction.type ===
                                                                    "income"
                                                                    ? "Income"
                                                                    : "Expense"}
                                                            </small>

                                                        </div>

                                                    </div>


                                                    <span className="category-badge">
                                                        {
                                                            transaction.category
                                                        }
                                                    </span>


                                                    <span className="date-text">

                                                        {new Date(
                                                            transaction.date
                                                        ).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric"
                                                            }
                                                        )}

                                                    </span>


                                                    <strong
                                                        className={
                                                            transaction.type ===
                                                                "income"
                                                                ? "amount income-amount"
                                                                : "amount expense-amount"
                                                        }
                                                    >
                                                        {transaction.type ===
                                                            "income"
                                                            ? "+"
                                                            : "-"}
                                                        ₹
                                                        {Number(
                                                            transaction.amount
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </strong>


                                                    <div className="row-actions">

                                                        <button
                                                            className="icon-button"
                                                            title="Edit"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    transaction
                                                                )
                                                            }
                                                        >
                                                            ✎
                                                        </button>

                                                        <button
                                                            className="icon-button delete"
                                                            title="Delete"
                                                            onClick={() =>
                                                                deleteTransaction(
                                                                    transaction._id
                                                                )
                                                            }
                                                        >
                                                            ×
                                                        </button>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                </div>

                            )}

                        </div>

                    </div>

                )}


                {/* TRANSACTIONS PAGE */}

                {activePage === "transactions" && (

                    <div className="page-section">

                        <div className="page-toolbar">

                            <div>

                                <h2>
                                    All Transactions
                                </h2>

                                <p>
                                    Manage your complete
                                    transaction history
                                </p>

                            </div>


                            <button
                                className="primary-button"
                                onClick={openAddModal}
                            >
                                + Add Transaction
                            </button>

                        </div>


                        <div className="filters">

                            <div className="filter-search">

                                <span>⌕</span>

                                <input
                                    type="text"
                                    placeholder="Search by title or category..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


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
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        <div className="transaction-table full-table">

                            <div className="table-header">

                                <span>
                                    Transaction
                                </span>

                                <span>
                                    Category
                                </span>

                                <span>
                                    Date
                                </span>

                                <span>
                                    Amount
                                </span>

                                <span>
                                    Actions
                                </span>

                            </div>


                            {filteredTransactions.length ===
                                0 ? (

                                <div className="empty-state">

                                    <div className="empty-state-icon">
                                        ₹
                                    </div>

                                    <h3>
                                        No transactions found
                                    </h3>

                                    <p>
                                        Try changing your
                                        search or filter.
                                    </p>

                                </div>

                            ) : (

                                filteredTransactions.map(
                                    (transaction) => (

                                        <div
                                            className="table-row"
                                            key={
                                                transaction._id
                                            }
                                        >

                                            <div className="transaction-name">

                                                <div
                                                    className={
                                                        transaction.type ===
                                                            "income"
                                                            ? "transaction-icon income"
                                                            : "transaction-icon expense"
                                                    }
                                                >
                                                    {transaction.type ===
                                                        "income"
                                                        ? "↗"
                                                        : "↘"}
                                                </div>

                                                <div>

                                                    <strong>
                                                        {
                                                            transaction.title
                                                        }
                                                    </strong>

                                                    <small>
                                                        {transaction.type}
                                                    </small>

                                                </div>

                                            </div>


                                            <span className="category-badge">
                                                {
                                                    transaction.category
                                                }
                                            </span>


                                            <span className="date-text">

                                                {new Date(
                                                    transaction.date
                                                ).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric"
                                                    }
                                                )}

                                            </span>


                                            <strong
                                                className={
                                                    transaction.type ===
                                                        "income"
                                                        ? "amount income-amount"
                                                        : "amount expense-amount"
                                                }
                                            >
                                                {transaction.type ===
                                                    "income"
                                                    ? "+"
                                                    : "-"}
                                                ₹
                                                {Number(
                                                    transaction.amount
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>


                                            <div className="row-actions">

                                                <button
                                                    className="icon-button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            transaction
                                                        )
                                                    }
                                                >
                                                    ✎
                                                </button>

                                                <button
                                                    className="icon-button delete"
                                                    onClick={() =>
                                                        deleteTransaction(
                                                            transaction._id
                                                        )
                                                    }
                                                >
                                                    ×
                                                </button>

                                            </div>

                                        </div>

                                    )
                                )

                            )}

                        </div>

                    </div>

                )}
                {/* REPORTS PAGE */}

                {activePage === "reports" && (

                    <div className="page-section">

                        <div className="page-toolbar">

                            <div>

                                <span className="page-label">
                                    ANALYTICS
                                </span>

                                <h2>
                                    Financial Reports
                                </h2>

                                <p>
                                    Understand your spending
                                    and income patterns.
                                </p>

                            </div>

                        </div>


                        {/* REPORT SUMMARY */}

                        <div className="stats-grid report-stats">

                            <div className="stat-card income-card">

                                <div className="stat-card-top">

                                    <span>
                                        Total Income
                                    </span>

                                    <div className="stat-icon income">
                                        ↗
                                    </div>

                                </div>

                                <h2>
                                    ₹
                                    {totalIncome.toLocaleString(
                                        "en-IN"
                                    )}
                                </h2>

                                <small>
                                    All recorded income
                                </small>

                            </div>


                            <div className="stat-card expense-card">

                                <div className="stat-card-top">

                                    <span>
                                        Total Expenses
                                    </span>

                                    <div className="stat-icon expense">
                                        ↘
                                    </div>

                                </div>

                                <h2>
                                    ₹
                                    {totalExpense.toLocaleString(
                                        "en-IN"
                                    )}
                                </h2>

                                <small>
                                    All recorded expenses
                                </small>

                            </div>


                            <div className="stat-card balance-card">

                                <div className="stat-card-top">

                                    <span>
                                        Net Balance
                                    </span>

                                    <div className="stat-icon balance">
                                        ₹
                                    </div>

                                </div>

                                <h2>
                                    ₹
                                    {balance.toLocaleString(
                                        "en-IN"
                                    )}
                                </h2>

                                <small>
                                    Income minus expenses
                                </small>

                            </div>


                            <div className="stat-card savings-card">

                                <div className="stat-card-top">

                                    <span>
                                        Savings Rate
                                    </span>

                                    <div className="stat-icon savings">
                                        %
                                    </div>

                                </div>

                                <h2>
                                    {savingsRate}%
                                </h2>

                                <small>
                                    Current savings rate
                                </small>

                            </div>

                        </div>


                        {/* MONTHLY CHART */}

                        <div className="analytics-card report-chart-card">

                            <div className="section-header">

                                <div>

                                    <h3>
                                        Income vs Expense
                                    </h3>

                                    <p>
                                        Financial activity
                                        over recent months
                                    </p>

                                </div>

                                <span className="period-label">
                                    Last 6 months
                                </span>

                            </div>


                            <div className="bar-chart">

                                {monthlyData.length === 0 ? (

                                    <div className="empty-chart">

                                        <div className="empty-icon">
                                            ◔
                                        </div>

                                        <p>
                                            No monthly data
                                            available yet.
                                        </p>

                                    </div>

                                ) : (

                                    monthlyData.map(
                                        (
                                            [month, values]
                                        ) => {

                                            const maxValue =
                                                Math.max(
                                                    values.income,
                                                    values.expense,
                                                    1
                                                );

                                            return (

                                                <div
                                                    className="chart-column"
                                                    key={month}
                                                >

                                                    <div className="bars">

                                                        <div
                                                            className="bar income"
                                                            style={{
                                                                height:
                                                                    `${Math.max(
                                                                        (
                                                                            values.income /
                                                                            maxValue
                                                                        ) *
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
                                                                        (
                                                                            values.expense /
                                                                            maxValue
                                                                        ) *
                                                                        100,
                                                                        5
                                                                    )}%`
                                                            }}
                                                        />

                                                    </div>

                                                    <span>
                                                        {month}
                                                    </span>

                                                </div>

                                            );

                                        }
                                    )

                                )}

                            </div>


                            <div className="chart-legend">

                                <span>
                                    <i className="legend-dot income-dot" />
                                    Income
                                </span>

                                <span>
                                    <i className="legend-dot expense-dot" />
                                    Expenses
                                </span>

                            </div>

                        </div>


                        {/* CATEGORY REPORT */}

                        <div className="analytics-card">

                            <div className="section-header">

                                <div>

                                    <h3>
                                        Spending by Category
                                    </h3>

                                    <p>
                                        Detailed expense
                                        distribution
                                    </p>

                                </div>

                            </div>


                            {categoryData.length === 0 ? (

                                <div className="empty-chart">

                                    <div className="empty-icon">
                                        ₹
                                    </div>

                                    <p>
                                        Add expenses to see
                                        category analytics.
                                    </p>

                                </div>

                            ) : (

                                <div className="category-report-grid">

                                    {categoryData.map(
                                        (
                                            [category, amount],
                                            index
                                        ) => {

                                            const percentage =
                                                totalExpense > 0
                                                    ? (
                                                        amount /
                                                        totalExpense
                                                    ) *
                                                    100
                                                    : 0;

                                            return (

                                                <div
                                                    className="report-category-card"
                                                    key={
                                                        category
                                                    }
                                                >

                                                    <div className="report-category-top">

                                                        <div
                                                            className={`category-dot dot-${index}`}
                                                        />

                                                        <strong>
                                                            {
                                                                category
                                                            }
                                                        </strong>

                                                        <span>
                                                            {Math.round(
                                                                percentage
                                                            )}
                                                            %
                                                        </span>

                                                    </div>


                                                    <h3>
                                                        ₹
                                                        {amount.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </h3>


                                                    <div className="category-track">

                                                        <div
                                                            className="category-fill"
                                                            style={{
                                                                width:
                                                                    `${percentage}%`
                                                            }}
                                                        />

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                )}


                {/* SETTINGS PAGE */}

                {activePage === "settings" && (

                    <div className="page-section">

                        <div className="page-toolbar">

                            <div>

                                <span className="page-label">
                                    PREFERENCES
                                </span>

                                <h2>
                                    Settings
                                </h2>

                                <p>
                                    Manage your account and
                                    application preferences.
                                </p>

                            </div>

                        </div>


                        <div className="settings-grid">

                            {/* PROFILE */}

                            <div className="settings-card">

                                <div className="settings-card-header">

                                    <div className="settings-icon">
                                        👤
                                    </div>

                                    <div>

                                        <h3>
                                            Profile
                                        </h3>

                                        <p>
                                            Your account
                                            information
                                        </p>

                                    </div>

                                </div>


                                <div className="profile-preview">

                                    <div className="large-avatar">

                                        {user.name
                                            ?.charAt(0)
                                            ?.toUpperCase()}

                                    </div>


                                    <div>

                                        <strong>
                                            {user.name}
                                        </strong>

                                        <span>
                                            {user.email}
                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* APPEARANCE */}

                            <div className="settings-card">

                                <div className="settings-card-header">

                                    <div className="settings-icon">
                                        ◐
                                    </div>

                                    <div>

                                        <h3>
                                            Appearance
                                        </h3>

                                        <p>
                                            Customize your
                                            dashboard
                                        </p>

                                    </div>

                                </div>


                                <div className="setting-row">

                                    <div>

                                        <strong>
                                            Dark Mode
                                        </strong>

                                        <span>
                                            Use a darker
                                            interface
                                        </span>

                                    </div>


                                    <button
                                        className={
                                            darkMode
                                                ? "toggle active"
                                                : "toggle"
                                        }
                                        onClick={() =>
                                            setDarkMode(
                                                (prev) =>
                                                    !prev
                                            )
                                        }
                                    >

                                        <span />

                                    </button>

                                </div>

                            </div>


                            {/* BUDGET SETTINGS */}

                            <div className="settings-card">

                                <div className="settings-card-header">

                                    <div className="settings-icon">
                                        🎯
                                    </div>

                                    <div>

                                        <h3>
                                            Monthly Budget
                                        </h3>

                                        <p>
                                            Set your spending
                                            limit
                                        </p>

                                    </div>

                                </div>


                                <div className="budget-setting">

                                    <label>
                                        Monthly Budget
                                    </label>

                                    <div className="budget-input">

                                        <span>
                                            ₹
                                        </span>

                                        <input
                                            type="number"
                                            value={budget}
                                            onChange={(e) =>
                                                setBudget(
                                                    Number(
                                                        e.target
                                                            .value
                                                    )
                                                )
                                            }
                                            onBlur={() =>
                                                localStorage.setItem(
                                                    "expense_budget",
                                                    budget
                                                )
                                            }
                                        />

                                    </div>

                                    <button
                                        className="primary-button"
                                        onClick={() =>
                                            updateBudget(
                                                budget
                                            )
                                        }
                                    >
                                        Save Budget
                                    </button>

                                </div>

                            </div>


                            {/* ACCOUNT */}

                            <div className="settings-card danger-card">

                                <div className="settings-card-header">

                                    <div className="settings-icon">
                                        ⚠
                                    </div>

                                    <div>

                                        <h3>
                                            Account
                                        </h3>

                                        <p>
                                            Manage your
                                            session
                                        </p>

                                    </div>

                                </div>


                                <button
                                    className="logout-large"
                                    onClick={logout}
                                >
                                    Logout from Account
                                </button>

                            </div>

                        </div>

                    </div>

                )}


            </main>


            {/* TRANSACTION MODAL */}

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
                        editingTransaction
                            ? (data) =>
                                updateTransaction(
                                    editingTransaction._id,
                                    data
                                )
                            : addTransaction
                    }
                />

            )}


            {/* TOAST */}

            {toast && (

                <div className="toast">

                    <span className="toast-icon">
                        ✓
                    </span>

                    <span>
                        {toast}
                    </span>

                </div>

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
            !title.trim() ||
            !amount ||
            Number(amount) <= 0
        ) {

            alert(
                "Please enter valid transaction details."
            );

            return;
        }


        onSave({
            title: title.trim(),
            amount: Number(amount),
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
                                type="text"
                                placeholder="e.g. Grocery shopping"
                                value={title}
                                onChange={(e) =>
                                    setTitle(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="input-group">

                            <label>
                                Amount
                            </label>

                            <input
                                type="number"
                                placeholder="0"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) =>
                                    setAmount(
                                        e.target.value
                                    )
                                }
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
// =====================================================
// EXPORT APP
// =====================================================

export default App;
