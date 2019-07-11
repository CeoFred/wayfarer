const express = require('express');
const logger = require('logger').createLogger('./app/development.log');

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
  console.log(data);

  if (!data.is_admin) {
    res.status(401).json(response.error('Access Denied'));
  }

  const uniqui = Utils.randomString(200);

  db.query(`SELECT * FROM bus WHERE bus_id = '${busId}'`).then((busData) => {
    if (busData.rowCount <= 0) {
      res.status(404).json(response.error('Bus not found'));
    } else if (Boolean(busData.rows[0].trip_status) === true) {
      res.status(403).json(response.error('Bus has a trip that is active'));
    } else {
      const query = {
        text: 'INSERT INTO trips(user_id,bus_id,origin,destination,trip_date,fare,departure_time,trip_id,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
        values: [data.userId, busId, origin, destination, tripDate, fare, departureTime, uniqui.trimRight(), 'Active'],
      };

      db.query(query).then((resp) => {
        db.query(`UPDATE bus SET trip_status = '${true}' WHERE bus_id = '${busId}' RETURNING *`).then(() => {
          res.status(201).json(response.success(resp.rows[0]));
        }).catch((err) => {
          logger.error(err);

          res.status(500).json(response.error('Something went wrong'));
        });
      }).catch((err) => {
        logger.error(err);

        res.status(500).json(response.error('Something went wrong'));
      });
    }
  }).catch((err) => {
    logger.error(err);

    res.status(500).json(response.error('Whoops! Something went wrong'));
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
    if (resp.rowCount < 0) {
      res.status(404).json(response.error('Trip Not found'));
    } else {
      db.query(`UPDATE trips SET status = 'cancelled' WHERE trip_id = '${tripId}' AND status = 'Active'`).then((busData) => {
        res.status(200).json(response.success({ message: 'Trip cancelled successfully', busData }));
      }).catch((err) => {
        res.status(500).json(response.error({ message: 'Trip failed to cancel' }));
        logger.error(err);
      });
    }
  }).catch((err) => {
    logger.error(err);

    res.status(500).json(response.error('Failed to fetch trips'));
  });
});

module.exports = router;
