"use strict";

var express = require('express');

var router = express.Router();

var logger = require('logger').createLogger('./app/development.log');

var response = require('../helpers/response');

var db = require('../config/db');

var Utils = require('../helpers/utils');

var authCheck = require('../middlewares/auth_check');

router.post('/', authCheck, function (req, res) {
  var _req$body = req.body,
      model = _req$body.model,
      numberPlate = _req$body.numberPlate,
      year = _req$body.year,
      manufacturer = _req$body.manufacturer,
      capacity = _req$body.capacity;
  var data = req.decoded.data;
  console.log(data);

  if (!data.is_admin) {
    res.status(403).json(response.error('Access Denied'));
  }

  var query = {
    text: 'INSERT INTO bus(bus_id,driver_id,model,number_plate,year,manufacturer,capacity,trip_status) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    values: [Utils.randomString(200), Utils.randomString(200), model, numberPlate, year, manufacturer, capacity, false]
  };
  db.query(query).then(function (respo) {
    res.status(201).json(response.success(respo.rows[0]));
  })["catch"](function (err) {
    logger.info(err);
  });
});
module.exports = router;
//# sourceMappingURL=bus.js.map