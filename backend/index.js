import express from 'express';
import { pool } from './db.js';
import { reverseGeocode } from './services/geolocation.js';
import { getSoilData, suggestCrops } from './services/agriApi.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.post('/api/user-location', async (req, res) => {
  const { latitude, longitude } = req.body;
  const { ward, block } = await reverseGeocode(latitude, longitude);
  const soil = await getSoilData(ward, block);
  res.json({ ward, block, soil, crops: suggestCrops(soil.soilType) });
});


app.listen(process.env.PORT||3001, ()=>console.log('API up'));
