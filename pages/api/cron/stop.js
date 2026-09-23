const { stopCronService, getCronStatus } = require('../../../lib/cron-service');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  stopCronService();
  const status = getCronStatus();
  
  return res.status(200).json({
    success: true,
    message: 'Cron service stopped',
    status: status,
    timestamp: new Date().toISOString()
  });
}
