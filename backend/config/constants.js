// config/constants.js
// Amazon fee tables and business logic config

const AMAZON_REFERRAL_FEES = {
  electronics:      0.08,   // 8%
  books:            0.15,
  clothing:         0.17,
  toys:             0.15,
  home:             0.15,
  beauty:           0.15,
  sports:           0.15,
  automotive:       0.12,
  default:          0.15,
};

// FBA fulfillment fees by weight bracket (GBP/EUR approx.)
const FBA_FEES_GBP = {
  small:  { maxWeightKg: 0.15, fee: 2.80 },
  medium: { maxWeightKg: 0.50, fee: 3.90 },
  large:  { maxWeightKg: 1.00, fee: 5.10 },
  xlarge: { maxWeightKg: 5.00, fee: 7.50 },
  heavy:  { maxWeightKg: 99,   fee: 10.50 },
};

const FBA_FEES_EUR = {
  small:  { maxWeightKg: 0.15, fee: 3.20 },
  medium: { maxWeightKg: 0.50, fee: 4.40 },
  large:  { maxWeightKg: 1.00, fee: 5.80 },
  xlarge: { maxWeightKg: 5.00, fee: 8.50 },
  heavy:  { maxWeightKg: 99,   fee: 12.00 },
};

// VAT rates
const VAT_RATES = {
  UK: 0.20,
  DE: 0.19,
  FR: 0.20,
  IT: 0.22,
  ES: 0.21,
};

// Opportunity flagging thresholds
const THRESHOLDS = {
  MIN_ROI_PERCENT:    20,   // Flag if ROI >= 20%
  MIN_PROFIT_GBP:     3.00, // Minimum absolute profit
  MIN_PROFIT_EUR:     3.50,
  MAX_SUPPLIER_COST:  500,  // Skip very expensive items
};

const MARKETPLACES = {
  UK: { currency: 'GBP', symbol: '£', vatRate: VAT_RATES.UK, fbaFees: FBA_FEES_GBP },
  DE: { currency: 'EUR', symbol: '€', vatRate: VAT_RATES.DE, fbaFees: FBA_FEES_EUR },
  FR: { currency: 'EUR', symbol: '€', vatRate: VAT_RATES.FR, fbaFees: FBA_FEES_EUR },
  IT: { currency: 'EUR', symbol: '€', vatRate: VAT_RATES.IT, fbaFees: FBA_FEES_EUR },
  ES: { currency: 'EUR', symbol: '€', vatRate: VAT_RATES.ES, fbaFees: FBA_FEES_EUR },
};

module.exports = {
  AMAZON_REFERRAL_FEES,
  FBA_FEES_GBP,
  FBA_FEES_EUR,
  VAT_RATES,
  THRESHOLDS,
  MARKETPLACES,
};
