const Investment = require('../models/Investment');
const { DEFAULT_RETURNS, calculateInvestment } = require('../utils/investmentCalculator');

const DISCLAIMER =
  'This is only a mathematical simulation based on a fixed return. It is not a guaranteed investment return.';

// POST /api/investments/simulate
const simulateInvestment = async (req, res) => {
  const initialAmount = Number(req.body.initialAmount);
  const monthlyContribution = Number(req.body.monthlyContribution || 0);
  const years = Number(req.body.years);
  const riskProfile = req.body.riskProfile || 'moderate';

  // If annualReturn is not given, use the default for the risk profile
  const annualReturn =
    req.body.annualReturn !== undefined ? Number(req.body.annualReturn) : DEFAULT_RETURNS[riskProfile];

  const result = calculateInvestment({ initialAmount, monthlyContribution, annualReturn, years });

  const investment = await Investment.create({
    user: req.user._id,
    initialAmount,
    monthlyContribution,
    annualReturn,
    years,
    riskProfile,
    ...result,
  });

  res.status(201).json({
    message: 'Investment simulated successfully',
    data: { ...investment.toObject(), disclaimer: DISCLAIMER },
  });
};

// GET /api/investments  (logged-in user's past simulations)
const getInvestments = async (req, res) => {
  const investments = await Investment.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({
    message: 'Investment simulations fetched successfully',
    data: investments,
  });
};

module.exports = { simulateInvestment, getInvestments };
