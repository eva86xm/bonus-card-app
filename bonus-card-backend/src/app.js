const express = require('express');
const cors = require('cors');

const sncRoutes = require('./routes/snc.routes');
const authRoutes = require('./routes/auth.routes');
const cardsRoutes = require('./routes/cards.routes');
const adminRoutes = require('./routes/admin.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/snc', sncRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function sncRequest(path, options = {}) {
  const baseUrl = process.env.SNC_API_URL;
  const apiKey = process.env.SNC_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error('SNC_API_URL или SNC_API_KEY не настроены');
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

async function ping() {
  return sncRequest('/api/auth/user');
}

module.exports = app;
