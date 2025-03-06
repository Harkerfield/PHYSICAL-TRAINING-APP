const app = require('./app');
require('dotenv').config();

const PORT = process.env.FRONTEND_SERVER_PORT || 3001;

app.listen(PORT, () => {
  console.log(`
  SP tester running on:
  http://localhost:${PORT}/
  `);
});