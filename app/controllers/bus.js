const express = require('express');

const router = express.Router();
const logger = require('logger').createLogger('./app/development.log');
const response = require('../helpers/response');
const db = require('../config/db');
const Utils = require('../helpers/utils');
const authCheck = require('../middlewares/auth_check');

router.post('/', authCheck, (req, res) => {
  const {
    model, numberPlate, year, manufacturer, capacity,
  } = req.body;
  const { data } = req.decoded;
  console.log(data);
  if (!data.is_admin) {
    res.status(403).json(response.error('Access Denied'));
  }
  const query = {
    text: 'INSERT INTO bus(bus_id,driver_id,model,number_plate,year,manufacturer,capacity,trip_status) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    values: [Utils.randomString(200), Utils.randomString(200), model, numberPlate, year, manufacturer, capacity, false],
  };
  db.query(query).then((respo) => {
    res.status(201).json(response.success(respo.rows[0]));
  }).catch((err) => {
    logger.info(err);
    res.status(500).json(response.error('Opps! somthing went wrong'));
  });
});
module.exports = router;
