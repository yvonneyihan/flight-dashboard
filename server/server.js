const path = require('path');
const http = require('http');
const express = require('express');
const app = require('./app');

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'client', 'dist');

  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
