const express = require('express');
const cors = require('cors');

const sncRoutes = require('./routes/snc.routes');
const authRoutes = require('./routes/auth.routes');
const cardsRoutes = require('./routes/cards.routes');
const adminRoutes = require('./routes/admin.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

const configuredOrigins = String(process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const developmentOrigins = process.env.NODE_ENV === 'production'
  ? []
  : ['http://127.0.0.1:8080', 'http://localhost:8080'];

const allowedOrigins = new Set([...configuredOrigins, ...developmentOrigins]);
const trustProxyValue = String(process.env.TRUST_PROXY || '').trim().toLowerCase();
const trustProxy = trustProxyValue === 'true'
  ? 1
  : (/^\d+$/.test(trustProxyValue) ? Number(trustProxyValue) : false);

app.disable('x-powered-by');
app.set('trust proxy', trustProxy || (process.env.NODE_ENV === 'production' ? 1 : false));

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  });
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    const error = new Error('Источник запроса не разрешен');
    error.status = 403;
    callback(error);
  },
  credentials: false
}));

app.use(express.json({ limit: '100kb' }));

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/snc', sncRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
