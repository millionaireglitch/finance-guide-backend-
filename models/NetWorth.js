const mongoose = require('mongoose');

// One net-worth snapshot per user per day
const netWorthSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalAssets: { type: Number, required: true },
    totalDebts: { type: Number, required: true },
    netWorth: { type: Number, required: true },
    recordDate: { type: String, required: true }, // format: YYYY-MM-DD
  },
  { timestamps: true }
);

module.exports = mongoose.model('NetWorth', netWorthSchema);
