# Backend Development Case Study: FinanceGuide

**Student Name:** Sneha Chaturvedi  
**Email:** 2025.snehac@isu.ac.in  
**Batch:** 2025 - 2029 Jeff Bezos Batch B.Tech CSE  
**Subject:** Backend Development  

---

## 1. Project Overview
**FinanceGuide** is a comprehensive Personal Finance Coach application designed as a REST API backend with a responsive Single Page Application (SPA) frontend. 

The architecture strictly follows the **M-V-C (Model-View-Controller)** pattern.
* **Database:** MongoDB (using Mongoose for Object Data Modeling)
* **Server Framework:** Node.js with Express.js
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs for password hashing
* **Real-Time Features:** Socket.io (for push notifications)
* **Frontend:** Vanilla HTML, CSS, JavaScript (Chart.js for visualizations)
* **Documentation:** Swagger UI

---

## 2. Real-Time Workflow (Socket.io)
One of the most complex features in this backend is the real-time **Overspending Alert System**. Here is exactly how it works step-by-step:

1. **Connection Initiation:** When you log in on the frontend, the browser connects to the server using `Socket.io` and sends your JWT token in the connection handshake.
2. **Socket Authentication:** In `server.js`, the backend intercepts this handshake, verifies the JWT token, extracts your `userId`, and maps it to a unique `socket.id` (stored in the `onlineUsers` dictionary).
3. **Trigger Event:** You add a new Expense. The `expenseController.js` saves the expense to MongoDB. 
4. **Calculations:** Immediately after saving, it calls the `checkOverspending()` function inside `alertController.js`. This function recalculates your total spending for the category and compares it to your monthly Budget limit.
5. **Real-Time Push:** If `spent > limit`, an Alert is saved to the database. The backend then looks up your `userId` in the `onlineUsers` dictionary. If you are online, it uses `io.to(socketId).emit('overspendingAlert', data)` to push the alert instantly to your screen. The frontend catches this event and displays a popup.

---

## 3. Viva Preparation: Core Concepts & Questionnaire

### Section A: Node.js & Express Architecture
**Q1: How does your Express application route requests? For example, when a user adds an Expense, how does that data travel from the route to the database?**
* **Answer:** When the frontend sends a `POST /api/expenses` request, it first hits `server.js`, which forwards it to `expenseRoutes.js`. 
The route passes the request through two middlewares: `protect` (which verifies the JWT token to ensure the user is authenticated) and `validate` (which ensures the amount/category inputs are formatted correctly). Finally, it reaches the `createExpense` function in `expenseController.js`, which uses the Mongoose `Expense` model to save the data into MongoDB.

**Q2: Why did you use `express-validator` in your routes instead of just checking the data inside the controller?**
* **Answer:** It separates concerns. `express-validator` acts as a firewall at the route level. It blocks bad requests (like negative numbers or missing fields) *before* they ever reach my business logic in the controller. This keeps the controller clean and focused only on database operations.

**Q3: How do you handle errors centrally in your application?**
* **Answer:** I use a central `errorMiddleware.js`. In Express 5, errors thrown in async controllers are automatically caught and forwarded to the next error handler. My custom middleware intercepts these errors (like Mongoose validation errors or database connection issues), formats them nicely into JSON, and sends a standardized error response back to the client so the server doesn't crash.

### Section B: Database (MongoDB & Mongoose)
**Q4: How did you structure the relationship between a User and their Transactions in MongoDB?**
* **Answer:** Since this is a NoSQL database, I used "Referencing" (Foreign Keys). Every Transaction, Budget, and Asset schema has a `user` field of type `mongoose.Schema.Types.ObjectId`, which holds a reference (ref: 'User') to the specific user who created it. When fetching data, I query `Transaction.find({ user: req.user._id })` to guarantee users only ever see their own data.

**Q5: What is a Mongoose "Pre-save Hook" and how did you use it?**
* **Answer:** A pre-save hook allows us to execute a function right before a document is saved to the database. In my `User` model, I use a `.pre('save')` hook to automatically encrypt (hash) the user's password using `bcryptjs`. This ensures that even if I accidentally save a plaintext password in a controller, the model intercepts it and secures it first.

### Section C: Authentication & JWT
**Q6: You used JWT for authentication. Can you explain how the backend securely verifies a user is logged in?**
* **Answer:** When a user logs in successfully, the backend creates a JSON Web Token containing their user ID and signs it with a secret key. The frontend stores this token and sends it in the `Authorization: Bearer <token>` header of every subsequent request. My `protect` middleware intercepts the request, verifies the signature using the same secret key, extracts the user ID, and attaches the user object to `req.user`.

**Q7: Why not just use Sessions and Cookies instead of JWT?**
* **Answer:** JWTs are stateless. The server doesn't have to keep track of logged-in users in its memory or database. Every token carries its own verifiable proof of identity, making the API more scalable and allowing the frontend to operate completely independently (like a true REST API).

### Section D: Miscellaneous
**Q8: Your project has an Admin role for Financial Tips. How is Role-Based Access Control implemented?**
* **Answer:** I created a `roleMiddleware.js`. When a user tries to hit the `POST /api/tips` endpoint to add a tip, the request first goes through the `protect` middleware to identify the user, and then goes through an `admin` middleware which simply checks if `req.user.role === 'admin'`. If they are just a 'user', it rejects the request with a 403 Forbidden status.

**Q9: Why did you choose Chart.js on the frontend instead of generating charts in the backend?**
* **Answer:** The backend's job is purely to manage and serve raw data (via REST API). Rendering UI components or charts is a presentation-layer task. By sending raw JSON data to the frontend and letting Chart.js draw the graphs, it follows the principle of separation of concerns and reduces the processing load on my Node server.
