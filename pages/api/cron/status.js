const { getCronStatus } = require('../../../lib/cron-service');

export default async function handler(req, res) {
  const status = getCronStatus();
  
  return res.status(200).json({
    success: true,
    status: status,
    timestamp: new Date().toISOString()
  });
}
