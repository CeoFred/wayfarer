import express from 'express';

import logger from 'logger';
import bodyParser from 'body-parser';

// config
import config from './config/config';

// database config
import db from './config/db';

const log = logger.createLogger('development.log');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// bootstrap routes
require('./routes')(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = { messgae: 'not found' };
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message; // eslint-disable-line no-param-reassign
  res.locals.error = config.isDev ? err : {}; // eslint-disable-line no-param-reassign
  log.error(err.message);
  res.status(err.status || 500).json({ status: 'failed', error: err.message });
  // eslint-disable-next-line no-console
});

db.on('error', (err) => {
  log.error(`db error ${err}`);
});


module.exports = app;
