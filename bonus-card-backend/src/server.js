require('dotenv').config();

const app = require('./app');

const port = Number(process.env.PORT) || 4000;
const host = process.env.HOST || '127.0.0.1';

app.listen(port, host, () => {
  console.log(`Bonus card backend is running on http://${host}:${port}`);
});
