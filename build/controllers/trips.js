"use strict";

var express = require('express');

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

  if (!data.is_admin) {
    res.status(401).json(response.error('Access Denied'));
  }

  var uniqui = Utils.randomString(200);
  var query = {
    text: 'INSERT INTO trips(user_id,bus_id,origin,destination,trip_date,fare,departure_time,trip_id,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
    values: [data.userId, busId, origin, destination, tripDate, fare, departureTime, uniqui.trimRight(), 'Active']
  };
  db.query(query).then(function (resp) {
    res.status(201).json(response.success(resp.rows[0]));
  })["catch"](function (err) {
    res.status(500).json(response.error(err));
    throw err;
  }); // res.json({})
}).post('/cancle/:trip_id', function (req, res) {}).get('/', function (req, res) {
  // get all trips available
  db.query("SELECT * FROM trips WHERE status = 'Active' ").then(function (resp) {
    res.status(200).json(response.success(resp.rows));
  })["catch"](function (err) {
    res.status(500).json(response.error('Failed to fetch trips'));
    throw err;
  });
}).get('/all/f/:origin', function (req, res) {}).get('/all/f/:destination', function (req, res) {});
module.exports = router;
//# sourceMappingURL=trips.js.map