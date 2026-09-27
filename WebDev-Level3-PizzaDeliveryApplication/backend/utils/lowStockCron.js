const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const sendEmail = require('./sendEmail');

// Runs on LOW_STOCK_CRON schedule (default: every 30 minutes).
// Emails the admin once per item when it first drops below its threshold,
// and clears the "alerted" flag once it's restocked so a future dip alerts again.
function startLowStockCron() {
  const schedule = process.env.LOW_STOCK_CRON || '*/30 * * * *';

  cron.schedule(schedule, async () => {
    try {
      const items = await Inventory.find({});
      const lowItems = items.filter(i => i.stock < i.threshold);
      const restockedItems = items.filter(i => i.stock >= i.threshold && i.lowStockAlerted);

      for (const item of restockedItems) {
        item.lowStockAlerted = false;
        await item.save();
      }

      const toAlert = lowItems.filter(i => !i.lowStockAlerted);
      if (toAlert.length === 0) return;

      const rows = toAlert.map(i =>
        `<tr><td>${i.type}</td><td>${i.name}</td><td>${i.stock}</td><td>${i.threshold}</td></tr>`
      ).join('');

      await sendEmail({
        to: process.env.ADMIN_ALERT_EMAIL,
        subject: `Low stock alert: ${toAlert.length} item(s) below threshold`,
        html: `<p>The following inventory items are below their configured threshold:</p>
               <table border="1" cellpadding="6" cellspacing="0">
               <tr><th>Type</th><th>Name</th><th>Stock</th><th>Threshold</th></tr>${rows}</table>`,
      });

      for (const item of toAlert) {
        item.lowStockAlerted = true;
        await item.save();
      }
      console.log(`Low-stock email sent for ${toAlert.length} item(s).`);
    } catch (err) {
      console.error('Low-stock cron error:', err.message);
    }
  });

  console.log(`Low-stock cron scheduled: "${schedule}"`);
}

module.exports = startLowStockCron;
