'use-strict';

const Pg = require('pg').Pool;
const config = require('./config');

const db = new Pg({
  user: config.database.user,
  host: config.database.host,
  database: config.database.database,
  password: config.database.password,
  port: config.database.port,
});

db.connect().then((data) => {
  console.log('Connected', data);
}).catch((err) => {
  console.log(`Database err: ${err}`);
});


module.exports = db;
