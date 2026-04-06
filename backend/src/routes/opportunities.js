// src/routes/opportunities.js

const express = require('express');
const router  = express.Router();
const { opportunityStore } = require('../data/store');

// GET /api/opportunities — list all flagged opportunities with optional filters
// Query params: marketplace, minRoi, minProfit, category
router.get('/', (req, res) => {
  const opportunities = opportunityStore.getAll(req.query);

  res.json({
    success: true,
    count: opportunities.length,
    filters: req.query,
    data: opportunities,
  });
});

// GET /api/opportunities/:id — single opportunity detail
router.get('/:id', (req, res) => {
  const opp = opportunityStore.getById(req.params.id);
  if (!opp) return res.status(404).json({ success: false, error: 'Opportunity not found' });
  res.json({ success: true, data: opp });
});

// GET /api/opportunities/stats/summary — aggregate stats
router.get('/stats/summary', (req, res) => {
  const all = opportunityStore.getAll();

  if (all.length === 0) {
    return res.json({ success: true, data: { count: 0, message: 'No opportunities yet. Run POST /api/scan first.' } });
  }

  const totalProfit   = all.reduce((sum, o) => sum + o.netProfit, 0);
  const avgRoi        = all.reduce((sum, o) => sum + o.roiPercent, 0) / all.length;
  const bestByRoi     = [...all].sort((a, b) => b.roiPercent - a.roiPercent)[0];
  const bestByProfit  = [...all].sort((a, b) => b.netProfit  - a.netProfit)[0];

  const byMarketplace = all.reduce((acc, o) => {
    acc[o.marketplace] = (acc[o.marketplace] || 0) + 1;
    return acc;
  }, {});

  const byCategory = all.reduce((acc, o) => {
    acc[o.category] = (acc[o.category] || 0) + 1;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      totalOpportunities: all.length,
      totalPotentialProfit: +totalProfit.toFixed(2),
      avgRoiPercent:  +avgRoi.toFixed(1),
      bestByRoi:      { asin: bestByRoi.asin, title: bestByRoi.title, roiPercent: bestByRoi.roiPercent },
      bestByProfit:   { asin: bestByProfit.asin, title: bestByProfit.title, netProfit: bestByProfit.netProfit },
      byMarketplace,
      byCategory,
    },
  });
});

module.exports = router;
