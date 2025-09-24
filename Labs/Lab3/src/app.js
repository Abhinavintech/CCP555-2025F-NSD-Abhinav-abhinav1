const express = require('express');
const cors = require('cors');
const compression = require('compression');
const passport = require('passport');
const { authenticate } = require('./auth');

const app = express();

passport.use(require('./auth').strategy());
app.use(passport.initialize());

app.use(cors());
app.use(compression());

app.use('/', require('./routes'));

// Add 404 middleware to handle any requests for resources that can't be found
app.use((req, res) => {
  res.status(404).json(require('./response').createErrorResponse(404, 'not found'));
});

module.exports = app;