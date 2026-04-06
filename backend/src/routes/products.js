// src/routes/products.js

const express   = require('express');
const router    = express.Router();
const { productStore }    = require('../data/store');
const { scanProduct }     = require('../services/profitCalculator');

// GET /api/products — list all products with optional filters
// Query params: category, supplier, minCost, maxCost
router.get('/', (req, res) => {
  const products = productStore.getAll(req.query);
  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

// GET /api/products/:id — get single product
router.get('/:id', (req, res) => {
  const product = productStore.getById(req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
  res.json({ success: true, data: product });
});

// GET /api/products/:id/profit — get full profit breakdown for all marketplaces
router.get('/:id/profit', (req, res) => {
  const product = productStore.getById(req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

  const breakdown = scanProduct(product);
  res.json({ success: true, product: { id: product.id, asin: product.asin, title: product.title }, data: breakdown });
});

// POST /api/products — add a new product
router.post('/', (req, res) => {
  const { asin, title, category, supplier, supplierCostGBP, weightKg, amazonPrices } = req.body;

  if (!asin || !title || !category || !supplier || !supplierCostGBP) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: asin, title, category, supplier, supplierCostGBP',
    });
  }

  const product = productStore.create({ asin, title, category, supplier, supplierCostGBP, weightKg, amazonPrices });
  res.status(201).json({ success: true, data: product });
});

// PUT /api/products/:id — update a product
router.put('/:id', (req, res) => {
  const updated = productStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Product not found' });
  res.json({ success: true, data: updated });
});

// DELETE /api/products/:id — remove a product
router.delete('/:id', (req, res) => {
  const deleted = productStore.delete(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: 'Product not found' });
  res.json({ success: true, message: 'Product deleted' });
});

module.exports = router;
