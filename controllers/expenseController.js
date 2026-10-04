const Expense = require('../models/Expense');
const { getMonthString } = require('../utils/budgetCalculator');
const { checkOverspending } = require('./alertController');

// POST /api/expenses
const createExpense = async (req, res) => {
  const { category, amount, description, date } = req.body;

  const expense = await Expense.create({
    user: req.user._id,
    category,
    amount,
    description,
    date,
  });

  // After adding an expense, check the budgets of that month for overspending
  const newAlerts = await checkOverspending(req.app, req.user._id, getMonthString(expense.date));

  res.status(201).json({
    message: 'Expense created successfully',
    data: { expense, newAlerts },
  });
};

// GET /api/expenses  (logged-in user's expenses)
const getExpenses = async (req, res) => {
  const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
  res.status(200).json({ message: 'Expenses fetched successfully', data: expenses });
};

// GET /api/expenses/user/:id  (own data, or any user's data for admin)
const getExpensesByUser = async (req, res) => {
  const expenses = await Expense.find({ user: req.params.id }).sort({ date: -1 });
  res.status(200).json({ message: 'Expenses fetched successfully', data: expenses });
};

module.exports = { createExpense, getExpenses, getExpensesByUser };
