// src/services/scanner.js
// Orchestrates a full scan: reads all products, runs profit calc, saves opportunities

const { productStore, opportunityStore, scanStore } = require('../data/store');
const { scanProduct, isOpportunity } = require('./profitCalculator');

/**
 * Runs a full arbitrage scan across all products and all marketplaces.
 * Clears previous opportunities, then re-populates with fresh results.
 *
 * @returns {Object} scan summary
 */
async function runFullScan() {
  const startedAt  = Date.now();
  const products   = productStore.getAll();

  if (products.length === 0) {
    return { error: 'No products found. Run `npm run seed` first.' };
  }

  // Clear stale opportunities before fresh scan
  opportunityStore.clear();

  let scannedCount     = 0;
  let opportunityCount = 0;

  for (const product of products) {
    const marketplaceResults = scanProduct(product);
    scannedCount++;

    for (const [marketplace, result] of Object.entries(marketplaceResults)) {
      if (isOpportunity(result)) {
        opportunityStore.create({
          productId:    product.id,
          asin:         product.asin,
          title:        product.title,
          category:     product.category,
          supplier:     product.supplier,
          marketplace,
          currency:     result.currency,
          symbol:       result.symbol,
          amazonPrice:  result.amazonPrice,
          supplierCost: result.supplierCost,
          fees:         result.fees,
          netProfit:    result.netProfit,
          roiPercent:   result.roiPercent,
          marginPercent:result.marginPercent,
        });
        opportunityCount++;
      }
    }
  }

  const durationMs = Date.now() - startedAt;

  const summary = {
    productsScanned:   scannedCount,
    opportunitiesFound: opportunityCount,
    durationMs,
  };

  // Save scan to history
  scanStore.create(summary);

  return summary;
}

module.exports = { runFullScan };
