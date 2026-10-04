const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    // Example types: cash, bank, property, vehicle, investment, other
    type: { type: String, required: true, trim: true },
    value: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);
