// src/data/pgStore.js
// PostgreSQL-backed store — drop-in replacement for store.js
// Usage: in src/index.js, swap require('./data/store') → require('./data/pgStore')

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/profitpath',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

// ── Products ──────────────────────────────────────────────
const productStore = {
  getAll: async (filters = {}) => {
    let query  = 'SELECT * FROM products WHERE 1=1';
    const vals = [];
    let i = 1;
    if (filters.category) { query += ` AND category = $${i++}`; vals.push(filters.category); }
    if (filters.supplier) { query += ` AND supplier = $${i++}`; vals.push(filters.supplier); }
    if (filters.minCost)  { query += ` AND supplier_cost_gbp >= $${i++}`; vals.push(+filters.minCost); }
    if (filters.maxCost)  { query += ` AND supplier_cost_gbp <= $${i++}`; vals.push(+filters.maxCost); }
    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, vals);
    return rows.map(dbToProduct);
  },

  getById: async (id) => {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return rows[0] ? dbToProduct(rows[0]) : null;
  },

  create: async (data) => {
    const { rows } = await pool.query(
      `INSERT INTO products (asin, title, category, supplier, supplier_cost_gbp, weight_kg, amazon_prices)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [data.asin, data.title, data.category, data.supplier,
       data.supplierCostGBP, data.weightKg || 0.5, JSON.stringify(data.amazonPrices || {})]
    );
    return dbToProduct(rows[0]);
  },

  update: async (id, data) => {
    const fields  = [];
    const vals    = [];
    let i = 1;
    if (data.title           !== undefined) { fields.push(`title=$${i++}`);             vals.push(data.title); }
    if (data.category        !== undefined) { fields.push(`category=$${i++}`);          vals.push(data.category); }
    if (data.supplier        !== undefined) { fields.push(`supplier=$${i++}`);          vals.push(data.supplier); }
    if (data.supplierCostGBP !== undefined) { fields.push(`supplier_cost_gbp=$${i++}`); vals.push(data.supplierCostGBP); }
    if (data.weightKg        !== undefined) { fields.push(`weight_kg=$${i++}`);         vals.push(data.weightKg); }
    if (data.amazonPrices    !== undefined) { fields.push(`amazon_prices=$${i++}`);     vals.push(JSON.stringify(data.amazonPrices)); }
    if (!fields.length) return null;
    fields.push(`updated_at=NOW()`);
    vals.push(id);
    const { rows } = await pool.query(
      `UPDATE products SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, vals
    );
    return rows[0] ? dbToProduct(rows[0]) : null;
  },

  delete: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id=$1', [id]);
    return rowCount > 0;
  },

  count: async () => {
    const { rows } = await pool.query('SELECT COUNT(*) FROM products');
    return +rows[0].count;
  },
};

// ── Opportunities ─────────────────────────────────────────
const opportunityStore = {
  getAll: async (filters = {}) => {
    let query  = 'SELECT * FROM opportunities WHERE 1=1';
    const vals = [];
    let i = 1;
    if (filters.marketplace) { query += ` AND marketplace=$${i++}`;   vals.push(filters.marketplace); }
    if (filters.category)    { query += ` AND category=$${i++}`;      vals.push(filters.category); }
    if (filters.minRoi)      { query += ` AND roi_percent>=$${i++}`;  vals.push(+filters.minRoi); }
    if (filters.minProfit)   { query += ` AND net_profit>=$${i++}`;   vals.push(+filters.minProfit); }
    query += ' ORDER BY roi_percent DESC';
    const { rows } = await pool.query(query, vals);
    return rows.map(dbToOpp);
  },

  getById: async (id) => {
    const { rows } = await pool.query('SELECT * FROM opportunities WHERE id=$1', [id]);
    return rows[0] ? dbToOpp(rows[0]) : null;
  },

  create: async (data) => {
    const { rows } = await pool.query(
      `INSERT INTO opportunities
        (product_id, asin, title, category, supplier, marketplace, currency, symbol,
         amazon_price, supplier_cost, fees, net_profit, roi_percent, margin_percent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [data.productId, data.asin, data.title, data.category, data.supplier,
       data.marketplace, data.currency, data.symbol, data.amazonPrice, data.supplierCost,
       JSON.stringify(data.fees), data.netProfit, data.roiPercent, data.marginPercent]
    );
    return dbToOpp(rows[0]);
  },

  clear: async () => {
    await pool.query('DELETE FROM opportunities');
  },

  count: async () => {
    const { rows } = await pool.query('SELECT COUNT(*) FROM opportunities');
    return +rows[0].count;
  },
};

// ── Scan history ──────────────────────────────────────────
const scanStore = {
  getAll: async () => {
    const { rows } = await pool.query('SELECT * FROM scan_history ORDER BY run_at DESC LIMIT 50');
    return rows.map(r => ({
      id: r.id, productsScanned: r.products_scanned,
      opportunitiesFound: r.opportunities_found, durationMs: r.duration_ms,
      runAt: r.run_at,
    }));
  },

  create: async (data) => {
    const { rows } = await pool.query(
      `INSERT INTO scan_history (products_scanned, opportunities_found, duration_ms)
       VALUES ($1,$2,$3) RETURNING *`,
      [data.productsScanned, data.opportunitiesFound, data.durationMs]
    );
    return rows[0];
  },
};

// ── Row mappers ───────────────────────────────────────────
function dbToProduct(r) {
  return {
    id: r.id, asin: r.asin, title: r.title, category: r.category,
    supplier: r.supplier, supplierCostGBP: +r.supplier_cost_gbp,
    weightKg: +r.weight_kg, amazonPrices: r.amazon_prices,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function dbToOpp(r) {
  return {
    id: r.id, productId: r.product_id, asin: r.asin, title: r.title,
    category: r.category, supplier: r.supplier, marketplace: r.marketplace,
    currency: r.currency, symbol: r.symbol, amazonPrice: +r.amazon_price,
    supplierCost: +r.supplier_cost, fees: r.fees, netProfit: +r.net_profit,
    roiPercent: +r.roi_percent, marginPercent: +r.margin_percent,
    detectedAt: r.detected_at,
  };
}

module.exports = { productStore, opportunityStore, scanStore, pool };
