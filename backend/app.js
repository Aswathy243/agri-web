import api from './routes/api.js';
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const ErrorResponse = require('./utils/errorResponse');
const errorHandler = require('./middlewares/error');


// Route files
const auth = require('./routes/auth');
const advisory = require('./routes/advisory');
const cropLoss = require('./routes/cropLoss');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/advisory', advisory);
app.use('/api/v1/crop-loss', cropLoss);

// Error handling middleware
app.use(errorHandler);

module.exports = app;