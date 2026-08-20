import express from 'express';
import dotenv from 'dotenv';
import pool from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Simple health check route - also proves DB connectivity
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      db_time: result.rows[0].now,
    });
  } catch (err) {
    console.error('Health check DB error:', err.message);
    res.status(500).json({ status: 'error', message: 'Database unreachable' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
