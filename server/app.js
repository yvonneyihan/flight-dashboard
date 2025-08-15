require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const path = require('path');

// Routers
const usersRouter = require('./routes/api/usersRouter');
const flightsRouter = require('./routes/api/flights');
const popularMapRoute = require('./routes/api/popularMap');

const app = express();

// CORS
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, 
    maxAge: 1000 * 60 * 60 * 24, 
  },
}));

// API routes
app.use('/api/users', usersRouter);
app.use('/api/flights', flightsRouter);
app.use('/api/popular-map', popularMapRoute);

// 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Serve React static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, 'client', 'dist');
  app.use(express.static(clientBuildPath));

  // Let React handle other non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

//Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message,
    ...(req.app.get('env') === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
