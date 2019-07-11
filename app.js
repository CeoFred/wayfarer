const express = require('express');
const log = require('logger').createLogger('./app/development.log');

const logger = require('morgan');
const bodyParser = require('body-parser');

const app = express();

// config
const config = require('./app/config/config');

// database config
const db = require('./app/config/db');

app.use(logger(config.isProd ? 'combined' : 'dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// bootstrap routes
require('./app/routes')(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = {messgae:"not found"}
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message; // eslint-disable-line no-param-reassign
  res.locals.error = config.isDev ? err : {}; // eslint-disable-line no-param-reassign
  log.error(err.message)
  res.status(err.status || 500).json({'status':'failed','error':err.message});
  // eslint-disable-next-line no-console
});

db.on('error', (err) => {
  log.error(`db error ${err}`)
});


module.exports = app;
