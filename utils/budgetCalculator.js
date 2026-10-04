const Income = require('../models/Income');
const Expense = require('../models/Expense');

// Round to 2 decimal places
const round = (num) => Math.round(num * 100) / 100;

// Add up the "amount" field of a list of records
const sumAmounts = (items) => items.reduce((total, item) => total + item.amount, 0);

// Get a month string like "2026-10" from a date
const getMonthString = (date = new Date()) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${month}`;
};

// Convert "2026-10" into a date range: 1 Oct 2026 (inclusive) to 1 Nov 2026 (exclusive)
const getMonthRange = (month) => {
  const [year, mon] = month.split('-').map(Number);
  return {
    start: new Date(year, mon - 1, 1),
    end: new Date(year, mon, 1),
  };
};

// Build a MongoDB date filter for a month (or no filter if month is not given)
const monthFilter = (month) => {
  if (!month) return {};
  const { start, end } = getMonthRange(month);
  return { date: { $gte: start, $lt: end } };
};

// Total spent in one category during one month.
// collation strength 2 = case-insensitive match ("Food" = "food")
const calculateSpent = async (userId, category, month) => {
  const expenses = await Expense.find({ user: userId, category, ...monthFilter(month) })
    .collation({ locale: 'en', strength: 2 });
  return round(sumAmounts(expenses));
};

// Basic summary: total income, total expenses and remaining amount
// Example: 60000 - 35000 = 25000
const calculateSummary = async (userId, month) => {
  const incomes = await Income.find({ user: userId, ...monthFilter(month) });
  const expenses = await Expense.find({ user: userId, ...monthFilter(month) });

  const totalIncome = round(sumAmounts(incomes));
  const totalExpenses = round(sumAmounts(expenses));

  return {
    month: month || 'all-time',
    totalIncome,
    totalExpenses,
    remaining: round(totalIncome - totalExpenses),
  };
};

module.exports = { round, getMonthString, calculateSpent, calculateSummary };
