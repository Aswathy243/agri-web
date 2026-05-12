import cron from 'node-cron';
import { pool } from './db.js';
import { fetchWeather } from './services/weather.js';
import { sendAlerts } from './services/notifier.js';

cron.schedule('0 6 * * *', async () => {
  const res = await pool.query(`SELECT * FROM farmers`);
  for (const f of res.rows) {
    const w = await fetchWeather(f.location_lat, f.location_lon);
    const advs = [ /* build advisories: frost, rain alerts, pest logic */ ];
    await sendAlerts(f, advs);
  }
  console.log('Alerts sent');
});
