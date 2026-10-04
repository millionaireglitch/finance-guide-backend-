const Asset = require('../models/Asset');
const Debt = require('../models/Debt');
const NetWorth = require('../models/NetWorth');
const { round, getMonthString } = require('../utils/budgetCalculator');

// GET /api/net-worth
// NET WORTH = TOTAL ASSETS - TOTAL DEBTS (only "active" debts)
const getNetWorth = async (req, res) => {
  const assets = await Asset.find({ user: req.user._id });
  const debts = await Debt.find({ user: req.user._id, status: 'active' });

  const totalAssets = round(assets.reduce((sum, a) => sum + a.value, 0));
  const totalDebts = round(debts.reduce((sum, d) => sum + d.amount, 0));
  const netWorth = round(totalAssets - totalDebts);

  // Save today's value in history (one record per day, updated if it already exists)
  const now = new Date();
  const today = `${getMonthString(now)}-${String(now.getDate()).padStart(2, '0')}`; // YYYY-MM-DD
  const record = await NetWorth.findOneAndUpdate(
    { user: req.user._id, recordDate: today },
    { totalAssets, totalDebts, netWorth },
    { upsert: true, new: true }
  );

  res.status(200).json({ message: 'Net worth calculated successfully', data: record });
};

// GET /api/net-worth/history
const getNetWorthHistory = async (req, res) => {
  const history = await NetWorth.find({ user: req.user._id }).sort({ recordDate: -1 });
  res.status(200).json({ message: 'Net worth history fetched successfully', data: history });
};

module.exports = { getNetWorth, getNetWorthHistory };
