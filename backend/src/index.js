// src/index.js

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const path      = require('path');

const productsRouter      = require('./routes/products');
const opportunitiesRouter = require('./routes/opportunities');
const scanRouter          = require('./routes/scan');
const { errorHandler, notFound } = require('./middleware');
const { productStore }    = require('./data/store');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(express.static(path.join(__dirname, 'public')));

if (productStore.count() === 0) {
  console.log('[Startup] Auto-seeding products...');
  require('./data/seed');
}

app.get('/api', (req, res) => {
  res.json({
    name: 'ProfitPath API', version: '1.0.0',
    dashboard: `http://localhost:${PORT}`,
    endpoints: {
      scan:            'POST /api/scan',
      scanHistory:     'GET  /api/scan/history',
      opportunities:   'GET  /api/opportunities',
      oppStats:        'GET  /api/opportunities/stats/summary',
      products:        'GET  /api/products',
      profitBreakdown: 'GET  /api/products/:id/profit',
    },
  });
});

app.use('/api/products',       productsRouter);
app.use('/api/opportunities',  opportunitiesRouter);
app.use('/api/scan',           scanRouter);
app.use('/api', notFound);
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`\n ProfitPath running at http://localhost:${PORT}`);
  console.log(` Dashboard:  http://localhost:${PORT}`);
  console.log(` API root:   http://localhost:${PORT}/api`);
  console.log(` Products:   ${productStore.count()} loaded\n`);
});

module.exports = app;
