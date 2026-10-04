const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    interestRate: { type: Number, default: 0, min: 0 }, // yearly % rate
    dueDate: { type: Date },
    // Only "active" debts are counted in net worth
    status: { type: String, enum: ['active', 'paid'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Debt', debtSchema);
