"use strict";

var express = require('express');

var router = express.Router();

var bcrypt = require('bcrypt');

var jwt = require('jsonwebtoken');

var _require = require('express-validator'),
    check = _require.check,
    validationResult = _require.validationResult,
    body = _require.body;

var _require2 = require('express-validator'),
    sanitizeBody = _require2.sanitizeBody;

var _response = require('../helpers/response');

var db = require('../config/db');

var Utils = require('../helpers/utils');

var auth_check = require('../middlewares/auth_check');

router.post('/', auth_check, function (req, res) {
  var _req$body = req.body,
      driver_id = _req$body.driver_id,
      model = _req$body.model,
      number_plate = _req$body.number_plate,
      year = _req$body.year,
      manufacturer = _req$body.manufacturer,
      capacity = _req$body.capacity;
  var data = req.decoded.data;
  console.log(data);

  if (!data.is_admin) {
    res.status(401).json(_response.error('Access Denied'));
  }
}).patch('/:bus_id', auth_check, function (req, res) {});
module.exports = router;
//# sourceMappingURL=bus.js.map