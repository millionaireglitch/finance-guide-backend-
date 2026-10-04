const Tip = require('../models/Tip');

// GET /api/tips?category=Savings  (category is optional)
const getTips = async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;

  const tips = await Tip.find(filter)
    .collation({ locale: 'en', strength: 2 }) // case-insensitive category filter
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({ message: 'Tips fetched successfully', data: tips });
};

// POST /api/tips  (admin only)
const createTip = async (req, res) => {
  const { title, content, category } = req.body;

  const tip = await Tip.create({ title, content, category, createdBy: req.user._id });

  res.status(201).json({ message: 'Tip created successfully', data: tip });
};

module.exports = { getTips, createTip };
