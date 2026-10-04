const Debt = require('../models/Debt');

// POST /api/debts
const createDebt = async (req, res) => {
  const { name, amount, interestRate, dueDate, status } = req.body;

  const debt = await Debt.create({
    user: req.user._id,
    name,
    amount,
    interestRate,
    dueDate,
    status,
  });

  res.status(201).json({ message: 'Debt created successfully', data: debt });
};

// GET /api/debts  (logged-in user's debts)
const getDebts = async (req, res) => {
  const debts = await Debt.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ message: 'Debts fetched successfully', data: debts });
};

// GET /api/debts/user/:id  (own data, or any user's data for admin)
const getDebtsByUser = async (req, res) => {
  const debts = await Debt.find({ user: req.params.id }).sort({ createdAt: -1 });
  res.status(200).json({ message: 'Debts fetched successfully', data: debts });
};

module.exports = { createDebt, getDebts, getDebtsByUser };
