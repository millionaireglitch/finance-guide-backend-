const Transaction = require('../models/Transaction');

// POST /api/transactions
const createTransaction = async (req, res) => {
  const { type, category, amount, description, date } = req.body;

  const transaction = await Transaction.create({
    user: req.user._id,
    type,
    category,
    amount,
    description,
    date,
  });

  res.status(201).json({ message: 'Transaction created successfully', data: transaction });
};

// GET /api/transactions  (only the logged-in user's transactions)
const getTransactions = async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
  res.status(200).json({ message: 'Transactions fetched successfully', data: transactions });
};

// GET /api/transactions/:id
const getTransactionById = async (req, res) => {
  // Searching by both id AND user makes sure users only see their own transaction
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });

  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  res.status(200).json({ message: 'Transaction fetched successfully', data: transaction });
};

module.exports = { createTransaction, getTransactions, getTransactionById };
