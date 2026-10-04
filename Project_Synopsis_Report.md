# Project Synopsis / Report: FinanceGuide

*(Note: You can copy and paste this content directly into Microsoft Word or Google Docs to format it as your official college submission report).*

---

## 1. Project Title
**FinanceGuide: A Real-Time Personal Finance & Wealth Coaching Platform**

## 2. Student Details
* **Name:** Sneha Chaturvedi
* **Email:** 2025.snehac@isu.ac.in
* **Batch:** 2025 - 2029 (Jeff Bezos Batch)
* **Course:** B.Tech Computer Science and Engineering (CSE)
* **Subject:** Backend Development Case Study

---

## 3. Abstract
Managing personal finances is a critical life skill, yet most college students and young professionals lack basic financial literacy. Existing expense trackers act as passive ledgers that only record data after money is already spent. **FinanceGuide** is designed to solve this by acting as a proactive "Personal Finance Coach". 

Built on a robust Node.js and MongoDB architecture, the platform goes beyond simple tracking. It features real-time Socket.io overspending alerts to correct behavior instantly, an intelligent onboarding engine to profile users, and built-in interactive financial literacy modules (such as Money Laws and Stock Market 101) to educate users on wealth generation.

## 4. Problem Statement
1. **Passive Tracking:** Traditional financial apps do not actively warn users when they are about to break their budget.
2. **Lack of Financial Literacy:** Beginners often fall into credit card debt traps or avoid investing due to a lack of actionable, realistic knowledge.
3. **Fragmented Data:** Users struggle to see the "big picture" (Net Worth) because their assets, debts, incomes, and expenses are scattered.

## 5. Proposed Solution & Key Features
FinanceGuide solves these issues through a centralized, intelligent web application:
* **Interactive Dashboard:** Visualizes cash flow (Income vs. Expenses) using smooth, interactive charts.
* **Real-Time Behavioral Alerts:** Uses WebSockets (Socket.io) to push instant notifications to the user's screen the millisecond a new expense exceeds their monthly budget limit.
* **Intelligent Onboarding Engine:** Profiles users upon registration (Status, Income, Preferred Banks) to dynamically assign them to Free or Premium tiers.
* **True Wealth Tracking:** Aggregates user Assets and Debts to calculate and chart historical Net Worth over time.
* **Financial Literacy Hub:** Includes an Admin-curated "Discover Hacks" feed (categorizing myths vs. saving hacks) and interactive "Money Law" calculators (e.g., 50/30/20 Rule, Rule of 72).

## 6. System Architecture (M-V-C)
The application strictly adheres to the **Model-View-Controller (MVC)** architectural pattern to ensure scalability and separation of concerns:
* **Model (Data Layer):** Mongoose schemas define the structure for Users, Transactions, Budgets, Assets, Debts, and Tips.
* **Controller (Business Logic):** Express.js controllers handle data processing, budget constraint calculations, and JWT generation.
* **View (Presentation Layer):** A Vanilla JavaScript Single Page Application (SPA) that consumes the REST APIs and dynamically updates the DOM without reloading the page.

## 7. Technology Stack
* **Backend Environment:** Node.js
* **Web Framework:** Express.js
* **Database:** MongoDB (NoSQL) with Mongoose ODM
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs
* **Real-Time Communication:** Socket.io
* **API Documentation:** Swagger UI
* **Frontend:** HTML5, CSS3, Vanilla JavaScript, Chart.js (for data visualization)

## 8. Security & Best Practices Implemented
* **Stateless Authentication:** Secure JWT tokens passed via HTTP headers protect all user routes.
* **Password Encryption:** Passwords are mathematically hashed using `bcryptjs` via Mongoose pre-save hooks before entering the database.
* **Role-Based Access Control (RBAC):** Middleware protects administrative routes, ensuring only authorized Admins can publish financial tips to the global feed.
* **Data Validation:** `express-validator` middleware blocks malicious or malformed payloads before they reach the business logic.

## 9. Future Scope
While the current platform is highly functional, the onboarding engine has laid the groundwork for future advanced features:
1. **AI-Powered Stock Predictions:** Integrating Machine Learning models to analyze Nifty 50 trends.
2. **Automated Tax Filing:** A premium feature to parse expenses and automatically generate tax-saving suggestions under various Indian IT sections (e.g., 80C).
3. **Bank API Synchronization:** Integrating with local aggregators (like Account Aggregator framework in India) to automatically pull transaction data from SBI, Kotak, or UPI apps.

## 10. Conclusion
FinanceGuide successfully demonstrates the power of modern backend engineering. By combining robust REST APIs, secure JWT authentication, and real-time WebSockets, the project delivers a seamless, highly responsive financial coaching experience. It fulfills all technical requirements of the B.Tech CSE Backend Development case study while providing genuine, real-world value to its users.
