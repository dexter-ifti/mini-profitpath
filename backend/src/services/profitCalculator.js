// src/services/profitCalculator.js
// Core engine: given a product + marketplace, calculates full profit breakdown

const { AMAZON_REFERRAL_FEES, MARKETPLACES, THRESHOLDS } = require('../../config/constants');

/**
 * Gets the FBA fee for a product based on weight and marketplace
 */
function getFbaFee(weightKg, marketplace) {
  const { fbaFees } = MARKETPLACES[marketplace];
  for (const tier of Object.values(fbaFees)) {
    if (weightKg <= tier.maxWeightKg) return tier.fee;
  }
  return fbaFees.heavy.fee;
}

/**
 * Gets the referral fee rate for a product category
 */
function getReferralRate(category) {
  return AMAZON_REFERRAL_FEES[category] || AMAZON_REFERRAL_FEES.default;
}

/**
 * Calculates full profit breakdown for one product on one marketplace
 *
 * @param {Object} product     - Product from store
 * @param {string} marketplace - e.g. 'UK', 'DE', 'FR'
 * @returns {Object}           - Full breakdown with profit, ROI, fees
 */
function calculateProfit(product, marketplace) {
  const config = MARKETPLACES[marketplace];
  if (!config) throw new Error(`Unknown marketplace: ${marketplace}`);

  const amazonPrice = product.amazonPrices?.[marketplace];
  if (!amazonPrice) return null; // Product not listed on this marketplace

  const supplierCost  = product.supplierCostGBP;
  const referralRate  = getReferralRate(product.category);
  const referralFee   = +(amazonPrice * referralRate).toFixed(2);
  const fbaFee        = getFbaFee(product.weightKg, marketplace);
  const vatOnSale     = +(amazonPrice * config.vatRate / (1 + config.vatRate)).toFixed(2);
  const totalCost     = +(supplierCost + referralFee + fbaFee).toFixed(2);
  const netProfit     = +(amazonPrice - vatOnSale - totalCost).toFixed(2);
  const roiPercent    = +((netProfit / supplierCost) * 100).toFixed(1);
  const marginPercent = +((netProfit / amazonPrice) * 100).toFixed(1);

  return {
    marketplace,
    currency:        config.currency,
    symbol:          config.symbol,
    amazonPrice,
    supplierCost,
    fees: {
      referral:   referralFee,
      fba:        fbaFee,
      vatOnSale,
      total:      +(referralFee + fbaFee + vatOnSale).toFixed(2),
    },
    netProfit,
    roiPercent,
    marginPercent,
    isViable: netProfit > 0,
  };
}

/**
 * Scans a product across ALL marketplaces and returns all breakdowns
 */
function scanProduct(product) {
  const results = {};
  for (const marketplace of Object.keys(MARKETPLACES)) {
    const calc = calculateProfit(product, marketplace);
    if (calc) results[marketplace] = calc;
  }
  return results;
}

/**
 * Decides if a profit result qualifies as an "opportunity"
 */
function isOpportunity(profitResult) {
  const minProfit = profitResult.currency === 'GBP'
    ? THRESHOLDS.MIN_PROFIT_GBP
    : THRESHOLDS.MIN_PROFIT_EUR;

  return (
    profitResult.roiPercent    >= THRESHOLDS.MIN_ROI_PERCENT &&
    profitResult.netProfit     >= minProfit &&
    profitResult.isViable
  );
}

module.exports = { calculateProfit, scanProduct, isOpportunity };
