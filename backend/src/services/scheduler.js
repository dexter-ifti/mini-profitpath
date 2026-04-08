// src/services/scheduler.js
// Auto-scan scheduler using node-cron
// Install: npm install node-cron
// Enable by setting env var: ENABLE_SCHEDULER=true

const { runFullScan } = require('./scanner');

let cronJob = null;

/**
 * Starts the scheduler.
 * Default: runs every hour.
 * Override with SCAN_CRON env var (standard cron syntax).
 *
 * Examples:
 *   '0 * * * *'    — every hour       (default)
 *   '0,30 * * * *' — every 30 minutes
 *   '0 9 * * *'    — every day at 9am
 */
async function startScheduler() {
  if (process.env.ENABLE_SCHEDULER !== 'true') {
    console.log('[Scheduler] Disabled — set ENABLE_SCHEDULER=true to enable');
    return;
  }

  let cron;
  try {
    cron = require('node-cron');
  } catch {
    console.warn('[Scheduler] node-cron not installed. Run: npm install node-cron');
    return;
  }

  const schedule = process.env.SCAN_CRON || '0 * * * *';

  if (!cron.validate(schedule)) {
    console.error(`[Scheduler] Invalid cron expression: "${schedule}"`);
    return;
  }

  console.log(`[Scheduler] Started — running scans on schedule: "${schedule}"`);

  // Run once immediately on startup
  console.log('[Scheduler] Running initial scan...');
  await runAndReport();

  cronJob = cron.schedule(schedule, async () => {
    console.log(`[Scheduler] Cron triggered at ${new Date().toISOString()}`);
    await runAndReport();
  });
}

async function runAndReport() {
  try {
    const result = await runFullScan();
    if (result.error) {
      console.warn('[Scheduler] Scan skipped:', result.error);
      return;
    }
    console.log(
      `[Scheduler] Scan complete — ${result.productsScanned} products, ` +
      `${result.opportunitiesFound} opportunities, ${result.durationMs}ms`
    );

  } catch (err) {
    console.error('[Scheduler] Scan failed:', err.message);
  }
}


function stopScheduler() {
  if (cronJob) {
    cronJob.stop();
    console.log('[Scheduler] Stopped');
  }
}

module.exports = { startScheduler, stopScheduler };
