const express = require('express');
const path = require('path');
const log = require('logger').createLogger('./app/development.log');

const logger = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const debug =require('debug')('server:debug');

// config
const config = require('./app/config/config');

// database config
const db = require('./app/config/db');


app.use(logger(config.isProd ? 'combined' : 'dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());

// bootstrap routes
require('./app/routes')(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message; // eslint-disable-line no-param-reassign
  res.locals.error = config.isDev ? err : {}; // eslint-disable-line no-param-reassign
  // render the error page
  log.error(err.message)
  res.status(err.status || 500).json({'status':'failed','error':err.message});
  // eslint-disable-next-line no-console
  console.log(err);
});

db.on('error', (err) => {
  console.log(err);
});


module.exports = app;
