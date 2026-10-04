require('dotenv').config(); // load .env first so every file can use process.env

const http = require('http');
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const swaggerSpec = require('./docs/swagger');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             example:
 *               message: FinanceGuide API is running
 *               data:
 *                 database: connected
 */
app.get('/api/health', (req, res) => {
  // readyState 1 means mongoose is connected
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    message: 'FinanceGuide API is running',
    data: { database: dbStatus },
  });
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/income', require('./routes/incomeRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/debts', require('./routes/debtRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));
app.use('/api/net-worth', require('./routes/netWorthRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/tips', require('./routes/tipRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Error handling (must be after all routes)
app.use(notFound);
app.use(errorHandler);

// ---------------- Socket.io (only for the "overspendingAlert" event) ----------------
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Keeps track of which socket belongs to which user: { userId: socketId }
const onlineUsers = {};

io.on('connection', (socket) => {
  // The client sends its JWT when connecting: io(URL, { auth: { token } })
  let userId;
  try {
    const decoded = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch (error) {
    socket.disconnect();
    return;
  }

  onlineUsers[userId] = socket.id;
  console.log(`Socket connected for user ${userId}`);

  socket.on('disconnect', () => {
    if (onlineUsers[userId] === socket.id) delete onlineUsers[userId];
  });
});

// Make io and onlineUsers available inside controllers via req.app.get(...)
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});
