const express = require('express');
const logger = require('logger').createLogger('./development.log');

const router = express.Router();
const response = require('../helpers/response');
const db = require('../config/db');
const Utils = require('../helpers/utils');

const authCheck = require('../middlewares/auth_check');

router.post('/', authCheck, (req, res) => {
  // new trip
  const {
    origin,
    destination,
    fare,
    trip_date,

  } = req.body;
  const { data } = req.decoded;
  console.log(data);

  if (!data.is_admin) {
    res.status(401).json(response.error('Access Denied'));
  }

  const uniqui = Utils.randomString(200);

  const query = {
    text: 'INSERT INTO trips(user_id,origin,destination,trip_date,fare,trip_id,status) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    values: [data.user_id, origin, destination, trip_date, fare, uniqui.trimRight(), 'Active'],
  };

  db.query(query).then((resp) => {
    const trip_data = resp.rows[0];
    trip_data.id = resp.rows[0].booking_id;
    res.status(201).json(response.success(trip_data));
  }).catch((err) => {
    logger.error(err);

    res.status(500).json(response.error('Something went wrong'));
  });
}).get('/', (req, res) => {
  // get all trips available
  db.query("SELECT * FROM trips WHERE status = 'Active' ").then((resp) => {
    res.status(200).json(response.success(resp.rows));
  }).catch((err) => {
    logger.error(err);

    res.status(500).json(response.error('Failed to fetch trips'));
  });
}).patch('/:tripId', authCheck, (req, res) => {
  // cancel a trip
  const tripId = req.params.tripId;
  const { data } = req.decoded;
  if (!data.is_admin) {
    res.status(401).json(response.error('Access Denied'));
  }

  db.query(`SELECT * FROM trips WHERE status = 'Active' AND trip_id = '${tripId}' `).then((resp) => {
    if (resp.rowCount <= 0) {
      res.status(404).json(response.error('Trip Not found'));
    } else {
      db.query(`UPDATE trips SET status = 'cancelled' WHERE trip_id = '${tripId}' AND status = 'Active'`).then((busData) => {
        res.status(200).json(response.success({ message: 'Trip cancelled successfully', busData }));
      }).catch((err) => {
        res.status(500).json(response.error({ message: 'Trip failed to cancel' }));
        logger.error({ err, message: 'while canceling trip' });
      });
    }
  }).catch((err) => {
    logger.error(err);

    res.status(500).json(response.error('Failed to fetch trips'));
  });
});

module.exports = router;
