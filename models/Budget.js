const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true, trim: true },
    limit: { type: Number, required: true, min: 0 },
    // "spent" is recalculated from the user's expenses for this category and month
    spent: { type: Number, default: 0 },
    month: { type: String, required: true }, // format: YYYY-MM, e.g. 2026-10
  },
  { timestamps: true }
);

module.exports = mongoose.model('Budget', budgetSchema);
