# FinanceGuide - Personal Finance Coach Backend

A clean and functional backend API for a Personal Finance Coach application, built as a B.Tech CSE Backend Development case study.

## Features
- **User Authentication:** Register and login with JWT.
- **Transactions:** Add and track income and expenses.
- **Debts & Assets:** Manage debts (active/paid) and track assets.
- **Budgets:** Set monthly limits per category and track spending.
- **Investment Simulator:** Estimate future growth based on monthly contributions and risk profiles.
- **Net Worth:** Automatically calculate current net worth (Assets - Active Debts) and view history.
- **Overspending Alerts:** Receive alerts when category spending exceeds the monthly budget (includes Socket.io real-time events).
- **Financial Tips:** Admins can post tips; users can view them.
- **Firebase Push Notifications:** (Optional) Integration for sending push alerts.

## Technology Stack
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database and ORM
- **JWT** & **bcryptjs** - Authentication and security
- **Socket.io** - Real-time alerts
- **Swagger UI** - API documentation
- **Firebase Admin** - Push notifications
- **express-validator** - Input validation

## Folder Structure
```text
FinanceGuide/
├── config/        # Database and Firebase configurations
├── controllers/   # Request handlers for each route
├── middleware/    # Auth, Roles, Validation, and Error handling
├── models/        # Mongoose database schemas
├── routes/        # Express route definitions
├── utils/         # Budget and Investment math calculators
├── docs/          # Swagger documentation config
├── .env.example   # Environment variables template
├── server.js      # Main application entry point
└── package.json   # Dependencies and NPM scripts
```

## Installation & Setup

1. **Install Node.js and MongoDB** on your machine.
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Environment Variables:**
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
   *Note: Firebase credentials are optional. If left blank, push notifications are safely skipped.*

4. **Start MongoDB:**
   Make sure your local MongoDB server is running on `mongodb://127.0.0.1:27017`.

5. **Start the API Server:**
   ```bash
   npm run dev
   ```

## API Documentation (Swagger)
Once the server is running, open the API documentation in your browser:
**http://localhost:8000/api-docs**

### Authentication Instructions
1. Go to **POST /api/auth/register** to create an account.
2. Go to **POST /api/auth/login** and log in.
3. Copy the `token` string from the response.
4. Scroll to the top of Swagger, click the **Authorize** button.
5. Paste the token into the Value box and click **Authorize**. You can now test protected endpoints.

## Example Workflow to Test
1. **Income & Expenses:** Add your salary (Income) and some daily purchases (Expenses).
2. **Budgets:** Create a budget for "Food" (e.g., 5000 limit for month "2026-10"). 
3. **Overspending:** Add an expense for "Food" of 6000. Check the **Alerts** endpoint to see your overspending alert.
4. **Assets & Debts:** Add a Bank Asset of 100000 and a Loan Debt of 20000.
5. **Net Worth:** Check the Net Worth endpoint. It will automatically calculate 80000 (100000 - 20000) and save it to history.
6. **Investments:** Use the Simulator to see how 10000 initial + 5000/month grows over 5 years.

## Role-Based Access (Admin Tips)
To test Admin features (like `POST /api/tips`):
1. Register a user.
2. Open MongoDB Compass.
3. Edit the user's document in the `users` collection and change `"role": "user"` to `"role": "admin"`.
4. Log in again via Swagger to get a new Admin JWT token.
5. You can now successfully create tips.
