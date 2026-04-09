# ProfitPath — Amazon Arbitrage Intelligence Engine

A backend system that detects profitable arbitrage opportunities across Amazon EU/UK marketplaces.

## Quick Start

```bash
npm install
npm start
```

Server starts at `http://localhost:3000`

## Project Structure

```
profitpath/
├── config/constants.js          ← fee tables, thresholds
└── src/
    ├── index.js                 ← app entry, serves dashboard + API
    ├── public/index.html        ← dashboard UI
    ├── data/
    │   ├── store.js             ← in-memory (old)
    │   ├── pgStore.js           ← PostgreSQL (current)
    │   ├── migrate.js           ← creates DB tables
    │   └── seed.js              ← 10 mock products
    ├── services/
    │   ├── profitCalculator.js  ← core fee engine
    │   ├── scanner.js           ← orchestrates full scan
    │   └── scheduler.js        ← cron auto-scan
    ├── routes/
    │   ├── products.js
    │   ├── opportunities.js
    │   └── scan.js
    └── middleware/index.js
```

## API Reference

### Trigger a scan
```
POST /api/scan
```
Runs profit calculations across all products and all marketplaces. Flags anything with ROI ≥ 20% and profit ≥ £3/€3.50.

### Get opportunities
```
GET /api/opportunities
GET /api/opportunities?marketplace=DE&minRoi=50&category=electronics
GET /api/opportunities/stats/summary
```

### Products
```
GET    /api/products
GET    /api/products/:id
GET    /api/products/:id/profit    ← full breakdown across all marketplaces
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Scan history
```
GET /api/scan/history
```

## Profit Formula

```
Net Profit = Amazon Price
           - VAT (included in price, backed out)
           - Referral Fee (8–17% by category)
           - FBA Fee (by weight bracket)
           - Supplier Cost
```

## Configuration

Edit `config/constants.js` to change:
- `THRESHOLDS.MIN_ROI_PERCENT` — minimum ROI to flag (default: 20%)
- `THRESHOLDS.MIN_PROFIT_GBP/EUR` — minimum absolute profit
- FBA fee tables by weight
- VAT rates by country

## Next Steps

1. **Add a real database** — swap `src/data/store.js` for PostgreSQL with `pg` or Prisma - added ✅
2. **Add a scheduler** — use `node-cron` to auto-scan every hour - added ✅
3. **Add a dashboard** — simple HTML table served from Express with filters and stats - added ✅
4. **Add real price data** — integrate Keepa API or scrape Amazon product pages - planned
