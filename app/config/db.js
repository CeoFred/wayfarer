'use-strict';

import { Pool } from 'pg';

const db = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'wayfarer',
  password: 'iftrueconnect',
  port: '5432',
});

db.connect().then((data) => {
  console.log('Connected', data);
}).catch((err) => {
  console.log(`Database err: ${err}`);
});


export default db;
