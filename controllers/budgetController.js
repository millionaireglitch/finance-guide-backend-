const Budget = require('../models/Budget');
const { calculateSpent, calculateSummary } = require('../utils/budgetCalculator');

// Recalculate "spent" for each budget and add "remaining" to the response
const refreshBudgets = async (budgets) => {
  const result = [];
  for (const budget of budgets) {
    budget.spent = await calculateSpent(budget.user, budget.category, budget.month);
    await budget.save();
    result.push({ ...budget.toObject(), remaining: budget.limit - budget.spent });
  }
  return result;
};

// POST /api/budgets
const createBudget = async (req, res) => {
  const { category, limit, month } = req.body;

  // Only one budget per category per month (case-insensitive category)
  const existing = await Budget.findOne({ user: req.user._id, category, month })
    .collation({ locale: 'en', strength: 2 });
  if (existing) {
    return res.status(400).json({ message: `A budget for ${category} in ${month} already exists` });
  }

  const budget = await Budget.create({ user: req.user._id, category, limit, month });

  // Fill in how much is already spent in this category for this month
  budget.spent = await calculateSpent(req.user._id, category, month);
  await budget.save();

  res.status(201).json({ message: 'Budget created successfully', data: budget });
};

// GET /api/budgets?month=YYYY-MM  (month is optional)
const getBudgets = async (req, res) => {
  const { month } = req.query;
  const filter = { user: req.user._id };
  if (month) filter.month = month;

  const budgets = await Budget.find(filter).sort({ month: -1 });

  res.status(200).json({
    message: 'Budgets fetched successfully',
    data: {
      summary: await calculateSummary(req.user._id, month), // total income, expenses, remaining
      budgets: await refreshBudgets(budgets),
    },
  });
};

// GET /api/budgets/user/:id  (own data, or any user's data for admin)
const getBudgetsByUser = async (req, res) => {
  const budgets = await Budget.find({ user: req.params.id }).sort({ month: -1 });

  res.status(200).json({
    message: 'Budgets fetched successfully',
    data: {
      summary: await calculateSummary(req.params.id),
      budgets: await refreshBudgets(budgets),
    },
  });
};

module.exports = { createBudget, getBudgets, getBudgetsByUser };
