import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Simple validation helper
function validateScan(body) {
  const { vin, partId, partSerial, warrantyMonths, scanTimestamp, operatorId } = body;
  if (!vin || !partId || !partSerial) return false;
  return true;
}

app.post('/scan', async (req, res) => {
  if (!validateScan(req.body)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const { vin, partId, partSerial, warrantyMonths = 24, scanTimestamp, operatorId } = req.body;
  try {
    const client = await pool.connect();
    const query = `INSERT INTO part_scans (vin, part_id, part_serial, scanned_at, operator_id)
                   VALUES ($1, $2, $3, $4, $5)
                   ON CONFLICT (vin, part_id, part_serial) DO UPDATE SET scanned_at = EXCLUDED.scanned_at`;
    await client.query(query, [vin, partId, partSerial, scanTimestamp, operatorId]);
    client.release();
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('DB error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
