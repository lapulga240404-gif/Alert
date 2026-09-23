const fetch = require('node-fetch');

// Send Discord webhook notification
async function sendDiscordAlert(product, result) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const mention = process.env.DISCORD_USER_ID ? `<@${process.env.DISCORD_USER_ID}> ` : '';

  const payload = {
    content: `${mention}🚨 **IN STOCK ALERT**\n🛒 **[OPEN PRODUCT PAGE](${product.url})**`,
    embeds: [{
      title: `🛒 ${product.name} IS IN STOCK`,
      url: product.url,
      color: 0x39FF14,
      description: `Available now at ${result?.siteLabel || 'your location'}!`,
      fields: [
        { name: 'Location', value: String(result?.siteLabel || 'Unknown'), inline: true },
        { name: 'Price', value: result?.price ? `₹${result.price}` : 'N/A', inline: true },
        { name: 'Stock', value: String(result?.stockLabel || 'In Stock'), inline: true }
      ],
      footer: { text: "Sentinel Stock Tracker • Auto-Check Every 1 Min" },
      timestamp: new Date().toISOString()
    }]
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    console.log(`✅ Sent alert for ${product.name} at ${result?.siteLabel || 'location'}`);
  } catch (err) {
    console.error(`❌ Discord webhook error:`, err.message);
  }
}

// Send test notification
async function sendTestAlert() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const userId = process.env.DISCORD_USER_ID;
  
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: userId ? `<@${userId}> 🚨 **DASHBOARD TEST**` : "🚨 **DASHBOARD TEST**",
        embeds: [{
          title: "✅ Next.js Dashboard Active",
          color: 0x39FF14,
          description: `24/7 monitoring system is operational.`,
          footer: { text: "Sentinel Pro • Next.js" },
          timestamp: new Date().toISOString()
        }]
      })
    });
    
    return res.ok;
  } catch (err) {
    console.error("Test webhook error:", err.message);
    return false;
  }
}

module.exports = {
  sendDiscordAlert,
  sendTestAlert
};
