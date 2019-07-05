const express = require('express');

const router = express.Router();
const response = require('../helpers/response');
const db = require('../config/db');
const Utils = require('../helpers/utils');

const authCheck = require('../middlewares/auth_check');

router.post('/', authCheck, (req, res) => {
// new trip
  const {
    busId,
    origin,
    destination,
    fare,
    tripDate,
    departureTime,

  } = req.body;
  const { data } = req.decoded;
  if (!data.is_admin) {
    res.status(401).json(response.error('Access Denied'));
  }

  const uniqui = Utils.randomString(200);

  const query = {
    text: 'INSERT INTO trips(user_id,bus_id,origin,destination,trip_date,fare,departure_time,trip_id,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
    values: [data.userId, busId, origin, destination, tripDate, fare, departureTime, uniqui.trimRight(), 'Active'],
  };

  db.query(query).then((resp) => {
    res.status(201).json(response.success(resp.rows[0]));
  }).catch((err) => {
    res.status(500).json(response.error(err));
    throw err;
  });

// res.json({})
}).post('/cancle/:trip_id', (req, res) => {


}).get('/', (req, res) => {
  // get all trips available
  db.query("SELECT * FROM trips WHERE status = 'Active' ").then((resp) => {
    res.status(200).json(response.success(resp.rows));
  }).catch((err) => {
    res.status(500).json(response.error('Failed to fetch trips'));
    throw err;
  });
}).get('/all/f/:origin', (req, res) => {

})
  .get('/all/f/:destination', (req, res) => {

  });

module.exports = router;
