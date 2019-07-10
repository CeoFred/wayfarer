"use strict";

var express = require('express');

var logger = require('logger').createLogger('./app/development.log');

var router = express.Router();

var response = require('../helpers/response');

var db = require('../config/db');

var Utils = require('../helpers/utils');

var authCheck = require('../middlewares/auth_check');

router.post('/', authCheck, function (req, res) {
  // new trip
  var _req$body = req.body,
      busId = _req$body.busId,
      origin = _req$body.origin,
      destination = _req$body.destination,
      fare = _req$body.fare,
      tripDate = _req$body.tripDate,
      departureTime = _req$body.departureTime;
  var data = req.decoded.data;
  console.log(data);

  if (!data.is_admin) {
    res.status(401).json(response.error('Access Denied'));
  }

  var uniqui = Utils.randomString(200);
  db.query("SELECT * FROM bus WHERE bus_id = '".concat(busId, "'")).then(function (busData) {
    if (busData.rowCount <= 0) {
      res.status(404).json(response.error('Bus not found'));
    } else if (Boolean(busData.rows[0].trip_status) === true) {
      res.status(403).json(response.error('Bus has a trip that is active'));
    }
  })["catch"](function (err) {
    logger.error(err);
    res.status(500).json(response.error('Whoops! Something went wrong'));
  });
  var query = {
    text: 'INSERT INTO trips(user_id,bus_id,origin,destination,trip_date,fare,departure_time,trip_id,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
    values: [data.userId, busId, origin, destination, tripDate, fare, departureTime, uniqui.trimRight(), 'Active']
  };
  db.query(query).then(function (resp) {
    db.query("UPDATE bus SET trip_status = '".concat(true, "' WHERE bus_id = '", busId, "' RETURNING *")).then(function () {
      res.status(201).json(response.success(resp.rows[0]));
    })["catch"](function (err) {
      logger.error(err);
      res.status(500).json(response.error('Something went wrong'));
    });
  })["catch"](function (err) {
    logger.error(err);
    res.status(500).json(response.error('Something went wrong'));
  });
}).get('/', function (req, res) {
  // get all trips available
  db.query("SELECT * FROM trips WHERE status = 'Active' ").then(function (resp) {
    res.status(200).json(response.success(resp.rows));
  })["catch"](function (err) {
    logger.error(err);
    res.status(500).json(response.error('Failed to fetch trips'));
  });
}).patch('/:tripId', authCheck, function (req, res) {
  // cancel a trip
  var tripId = req.params.tripId;
  var data = req.decoded.data;

  if (!data.is_admin) {
    res.status(401).json(response.error('Access Denied'));
  }

  db.query("SELECT * FROM trips WHERE status = 'Active' AND trip_id = '".concat(tripId, "' ")).then(function (resp) {
    if (resp.rowCount < 0) {
      res.status(404).json(response.error('Trip Not found'));
    } else {
      db.query("UPDATE trips SET status = 'cancelled' WHERE trip_id = '".concat(tripId, "' AND status = 'Active'")).then(function (busData) {
        res.status(200).json(response.success({
          message: 'Trip cancelled successfully',
          busData: busData
        }));
      })["catch"](function (err) {
        res.status(500).json(response.error({
          message: 'Trip failed to cancel'
        }));
        logger.error(err);
      });
    }
  })["catch"](function (err) {
    logger.error(err);
    res.status(500).json(response.error('Failed to fetch trips'));
  });
});
module.exports = router;
//# sourceMappingURL=trips.js.map