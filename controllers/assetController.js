const Asset = require('../models/Asset');

// POST /api/assets
const createAsset = async (req, res) => {
  const { name, type, value, date } = req.body;

  const asset = await Asset.create({
    user: req.user._id,
    name,
    type,
    value,
    date,
  });

  res.status(201).json({ message: 'Asset created successfully', data: asset });
};

// GET /api/assets  (logged-in user's assets)
const getAssets = async (req, res) => {
  const assets = await Asset.find({ user: req.user._id }).sort({ date: -1 });
  res.status(200).json({ message: 'Assets fetched successfully', data: assets });
};

// GET /api/assets/user/:id  (own data, or any user's data for admin)
const getAssetsByUser = async (req, res) => {
  const assets = await Asset.find({ user: req.params.id }).sort({ date: -1 });
  res.status(200).json({ message: 'Assets fetched successfully', data: assets });
};

module.exports = { createAsset, getAssets, getAssetsByUser };
