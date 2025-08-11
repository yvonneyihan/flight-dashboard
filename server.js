const app = require('./app');
const http = require('http');

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
