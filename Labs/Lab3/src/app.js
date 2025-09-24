const express = require('express');
const cors = require('cors');
const compression = require('compression');

const app = express();

app.use(cors());
app.use(compression());

app.use('/', require('./routes'));

module.exports = app;