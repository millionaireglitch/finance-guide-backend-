const mongoose = require('mongoose');

// Stores each investment simulation the user runs
const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    initialAmount: { type: Number, required: true },
    monthlyContribution: { type: Number, required: true },
    annualReturn: { type: Number, required: true },
    years: { type: Number, required: true },
    riskProfile: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      required: true,
    },
    totalInvested: { type: Number, required: true },
    projectedValue: { type: Number, required: true },
    estimatedGain: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Investment', investmentSchema);
