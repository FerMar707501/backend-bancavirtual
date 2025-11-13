const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares de seguridad
app.use(helmet());

// CORS - permitir múltiples orígenes
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como Postman) o desde localhost/127.0.0.1 en cualquier puerto
    if (!origin) {
      callback(null, true);
    } else {
      const url = new URL(origin);
      const isLocal = url.hostname === 'localhost' || 
                      url.hostname === '127.0.0.1' || 
                      url.hostname === '[::1]';
      
      if (isLocal) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏦 API Banco Virtual - Sistema Bancario',
    version: '1.0.0',
    status: 'active'
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
