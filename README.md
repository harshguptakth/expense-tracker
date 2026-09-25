# Expense Tracker

Expense Tracker is a full-stack web application that helps users manage their income and expenses in one place.

Users can create an account, log in securely, add their income and expenses, edit or delete transactions, and see their overall financial summary through a simple dashboard.

## Features

- User registration and login
- Secure password handling
- JWT-based authentication
- Add income and expense transactions
- Edit and delete transactions
- View complete transaction history
- Filter transactions by category
- Monthly expense tracking
- Income, expense and balance summary
- Savings calculation
- Responsive dashboard
- Data stored securely in MongoDB

## Technologies Used

### Frontend
- React.js
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js
- REST API

### Database
- MongoDB
- Mongoose

### Authentication
- JSON Web Token (JWT)
- bcrypt.js

## How the Project Works

The frontend is built using React.js. It communicates with the backend through REST APIs.

The backend is developed using Node.js and Express.js. It handles user authentication, transaction operations and communication with the database.

MongoDB is used to store user and transaction data.

The basic flow is:

React.js → Express.js / Node.js → MongoDB

## Main Features

### Authentication

Users can create an account and log in using their email and password.

Passwords are encrypted using bcrypt before being stored in the database.

JWT is used to maintain authenticated sessions.

### Transaction Management

Users can:

- Add income
- Add expenses
- Edit transactions
- Delete transactions
- View transaction history
- Filter transactions

Each transaction contains information such as title, amount, type, category and date.

### Dashboard

The dashboard provides a quick overview of the user's financial activity, including:

- Total income
- Total expenses
- Current balance
- Savings
- Recent transactions

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login

Running the Project Locally
1. Clone the repository
git clone https://github.com/harshguptakth/expense-tracker.git
2. Start the Backend
cd backend
npm install
npm start

The backend runs on:

http://localhost:5000
3. Start the Frontend

Open another terminal:

cd frontend
npm install
npm start

The frontend runs on:

http://localhost:3000
Environment Variables

Create a .env file inside the backend folder.

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Do not upload the .env file to GitHub.

Project Structure
Expense-Tracker
│
├── backend
│   ├── models
│   ├── routes
│   ├── server.js
│   └── package.json
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
└── .gitignore
Future Improvements

Some features I plan to add in the future are:

Expense charts and reports
Better monthly budget planning
Export transactions to PDF or Excel
Email notifications
Advanced financial analytics
Deployment with a cloud database
What I Learned

While building this project, I learned how a frontend and backend communicate using REST APIs, how to work with MongoDB, how authentication works using JWT, and how to build CRUD operations in a real-world application.

Author

Harsh Kumar Gupta

B.Tech – Information Technology
BIT Sindri

GitHub: https://github.com/harshguptakth
