const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, default: 'overspending' },
    category: { type: String, required: true },
    budget: { type: Number, required: true }, // the budget limit
    spent: { type: Number, required: true }, // actual spending
    month: { type: String, required: true }, // YYYY-MM
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
