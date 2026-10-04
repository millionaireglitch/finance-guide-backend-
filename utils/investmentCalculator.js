// Simple assumption: if the user does not give an annual return,
// we use a default yearly return (%) based on their risk profile.
const DEFAULT_RETURNS = {
  conservative: 6,
  moderate: 10,
  aggressive: 14,
};

const round = (num) => Math.round(num * 100) / 100;

/*
 * Future value with monthly compounding:
 *
 *   r = annualReturn / 12 / 100      (monthly rate)
 *   n = years * 12                   (number of months)
 *
 *   Value of initial amount   = P * (1 + r)^n
 *   Value of monthly deposits = PMT * ((1 + r)^n - 1) / r
 *
 *   Projected value = both added together
 */
const calculateInvestment = ({ initialAmount, monthlyContribution, annualReturn, years }) => {
  const r = annualReturn / 12 / 100;
  const n = years * 12;

  let projectedValue;
  if (r === 0) {
    // No growth: just add up the money
    projectedValue = initialAmount + monthlyContribution * n;
  } else {
    const growth = Math.pow(1 + r, n);
    projectedValue = initialAmount * growth + monthlyContribution * ((growth - 1) / r);
  }

  const totalInvested = initialAmount + monthlyContribution * n;

  return {
    totalInvested: round(totalInvested),
    projectedValue: round(projectedValue),
    estimatedGain: round(projectedValue - totalInvested),
  };
};

module.exports = { DEFAULT_RETURNS, calculateInvestment };
