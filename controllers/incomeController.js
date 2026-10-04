const Income = require('../models/Income');

// POST /api/income
const createIncome = async (req, res) => {
  const { amount, source, date, description } = req.body;

  const income = await Income.create({
    user: req.user._id,
    amount,
    source,
    date,
    description,
  });

  res.status(201).json({ message: 'Income created successfully', data: income });
};

// GET /api/income  (logged-in user's income)
const getIncome = async (req, res) => {
  const income = await Income.find({ user: req.user._id }).sort({ date: -1 });
  res.status(200).json({ message: 'Income fetched successfully', data: income });
};

// GET /api/income/user/:id  (own data, or any user's data for admin)
const getIncomeByUser = async (req, res) => {
  const income = await Income.find({ user: req.params.id }).sort({ date: -1 });
  res.status(200).json({ message: 'Income fetched successfully', data: income });
};

module.exports = { createIncome, getIncome, getIncomeByUser };
