import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import widgetRoutes from './routes/widget.routes.js';
import { requireAuth } from './middleware/auth.middleware.js';
import { getWidgetConfig } from './controllers/public.controller.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', db_time: result.rows[0].now });
  } catch (err) {
    console.error('Health check DB error:', err.message);
    res.status(500).json({ status: 'error', message: 'Database unreachable' });
  }
});

// Versioned widget bundle - long cache since the URL itself changes on release (v1, v2...)
app.use('/widget.v1.js', express.static(path.join(__dirname, '../public/widget.v1.js'), {
  maxAge: '1y',
  immutable: true,
}));

// Public, cached widget config
app.get('/widgets/:id/config', getWidgetConfig);

app.use('/auth', authRoutes);
app.use('/widgets', widgetRoutes);

app.get('/whoami', requireAuth, (req, res) => {
  res.json({ message: 'You are authenticated', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
