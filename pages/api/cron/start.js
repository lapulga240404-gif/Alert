const { startCronService, getCronStatus } = require('../../../lib/cron-service');

export default async function handler(req, res) {
  // Allow both GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auto-start on Railway (production) - check if RAILWAY_ENVIRONMENT exists
  if (process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production') {
    startCronService();
  }

  const status = getCronStatus();
  
  return res.status(200).json({
    success: true,
    message: status.isActive ? 'Cron service is running' : 'Cron service ready (click Start to begin)',
    status: status,
    timestamp: new Date().toISOString()
  });
}
