// src/data/store.js
// In-memory store — will swap this out for PostgreSQL/MongoDB later

const { v4: uuidv4 } = require('uuid');

let products      = [];
let opportunities = [];
let scanHistory   = [];

// ── Products ──────────────────────────────────────────────
const productStore = {
  getAll: (filters = {}) => {
    let result = [...products];
    if (filters.category) result = result.filter(p => p.category === filters.category);
    if (filters.supplier) result = result.filter(p => p.supplier === filters.supplier);
    if (filters.minCost)  result = result.filter(p => p.supplierCostGBP >= +filters.minCost);
    if (filters.maxCost)  result = result.filter(p => p.supplierCostGBP <= +filters.maxCost);
    return result;
  },

  getById: (id) => products.find(p => p.id === id) || null,

  create: (data) => {
    const product = {
      id:              uuidv4(),
      asin:            data.asin,
      title:           data.title,
      category:        data.category,
      supplier:        data.supplier,
      supplierCostGBP: data.supplierCostGBP,
      weightKg:        data.weightKg || 0.5,
      amazonPrices:    data.amazonPrices || {},  // { UK: 29.99, DE: 34.99, ... }
      createdAt:       new Date().toISOString(),
      updatedAt:       new Date().toISOString(),
    };
    products.push(product);
    return product;
  },

  update: (id, data) => {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() };
    return products[idx];
  },

  delete: (id) => {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    products.splice(idx, 1);
    return true;
  },

  count: () => products.length,
  seed: (data) => { products = data; },
};

// ── Opportunities ─────────────────────────────────────────
const opportunityStore = {
  getAll: (filters = {}) => {
    let result = [...opportunities];
    if (filters.marketplace) result = result.filter(o => o.marketplace === filters.marketplace);
    if (filters.minRoi)      result = result.filter(o => o.roiPercent >= +filters.minRoi);
    if (filters.minProfit)   result = result.filter(o => o.netProfit >= +filters.minProfit);
    if (filters.category)    result = result.filter(o => o.category === filters.category);
    // Sort by ROI descending by default
    result.sort((a, b) => b.roiPercent - a.roiPercent);
    return result;
  },

  getById: (id) => opportunities.find(o => o.id === id) || null,

  create: (data) => {
    const opp = { id: uuidv4(), ...data, detectedAt: new Date().toISOString() };
    opportunities.push(opp);
    return opp;
  },

  clear: () => { opportunities = []; },
  count: () => opportunities.length,
};

// ── Scan History ──────────────────────────────────────────
const scanStore = {
  getAll: () => [...scanHistory].reverse(),

  create: (summary) => {
    const scan = { id: uuidv4(), ...summary, runAt: new Date().toISOString() };
    scanHistory.push(scan);
    return scan;
  },
};

module.exports = { productStore, opportunityStore, scanStore };
