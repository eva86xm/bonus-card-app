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

module.exports = app;