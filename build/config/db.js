"use strict";
'use-strict';

var Pg = require('pg').Pool;

var config = require('./config');

var db = new Pg({
  user: config.database.user,
  host: config.database.host,
  database: config.database.database,
  password: config.database.password,
  port: config.database.port,
  ssl: config.database.ssl
});
db.connect().then(function () {
  return console.log('Connected');
})["catch"](function (err) {
  console.log("Database err: ".concat(err));
});
module.exports = db;
//# sourceMappingURL=db.js.map