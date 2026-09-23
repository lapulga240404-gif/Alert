const { sendTestAlert } = require('../../lib/discord');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const success = await sendTestAlert();
    
    if (success) {
      return res.status(200).json({ success: true, message: 'Test alert sent' });
    } else {
      return res.status(500).json({ success: false, error: 'Failed to send test alert' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
