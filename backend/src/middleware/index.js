// src/middleware/index.js

/**
 * Global error handler — catches anything thrown in routes
 */
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.path} →`, err.message);
  res.status(err.status || 500).json({
    success: false,
    error:   err.message || 'Internal server error',
  });
}

/**
 * 404 handler — catches unmatched routes
 */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    error:  `Route not found: ${req.method} ${req.path}`,
    hint:   'See GET / for available endpoints',
  });
}

module.exports = { errorHandler, notFound };