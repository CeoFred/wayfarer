/* eslint-disable linebreak-style */
/* eslint-disable global-require, func-names */
module.exports = function (app) {
  // user route
  app.use('/api/v1/user', require('./controllers/user'));
  //  trip route
  app.use('/api/v1/trips', require('./controllers/trips'));
  // booking route
  app.use('/api/v1/bookings', require('./controllers/bookings'));

  app.use('/api/v1/bus', require('./controllers/bus'));
};
