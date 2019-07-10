const express = require('express');

const router = express.Router();


const response = require('../helpers/response');
const db = require('../config/db');
const Utils = require('../helpers/utils');

const authCheck = require('../middlewares/auth_check');


router.post('/', authCheck, (req, res) => {
  const {
    driverId,
    model,
    numberPlate,
    year,
    manufacturer,
    capacity,

  } = req.body;
  const { data } = req.decoded;
  console.log(data);
  if (!data.is_admin) {
    res.status(401).json(response.error('Access Denied'));
  }
  const query = {
    text: 'INSERT INTO bus(bus_id,driver_id,model,number_plate,year,manufacturer,capacity) VALUES($1,$2,$3,$4,$5) RETURNING *',
    values: [Utils.randomString(20), driverId, model, numberPlate, year, manufacturer, capacity],
  };
  db.query(query).then((respo) => {
    res.status(201).json(response.success(respo.rows[0]));
  });
});


module.exports = router;
