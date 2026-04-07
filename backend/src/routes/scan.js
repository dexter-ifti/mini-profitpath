// src/routes/scan.js

const express = require('express');
const router  = express.Router();
const { runFullScan } = require('../services/scanner');
const { scanStore }   = require('../data/store');

// POST /api/scan — trigger a fresh arbitrage scan across all products
router.post('/', async (req, res) => {
  try {
    console.log('[Scan] Starting full arbitrage scan...');
    const result = await runFullScan();

    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    console.log(`[Scan] Done — ${result.opportunitiesFound} opportunities found in ${result.durationMs}ms`);
    res.json({ success: true, data: result });

  } catch (err) {
    console.error('[Scan] Error:', err.message);
    res.status(500).json({ success: false, error: 'Scan failed', details: err.message });
  }
});

// GET /api/scan/history — list previous scan runs
router.get('/history', (req, res) => {
  const history = scanStore.getAll();
  res.json({ success: true, count: history.length, data: history });
});

module.exports = router;
