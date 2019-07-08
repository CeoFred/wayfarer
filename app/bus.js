const express = require('express');

const router = express.Router();

const Utils = require('../helpers/utils');

const db = require('../config/db')

const _response = require('../helpers/response')

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    check,
    validationResult,body
} = require('express-validator');

const {
    sanitizeBody
} = require('express-validator');

const auth_check = require('../middlewares/auth_check')


router.post('/',auth_check,(req,res) => {
    const {
        driver_id,
        model,
        number_plate,
        year,
        manufacturer,
        capacity,
        
    } = req.body
    const {data} = req.decoded
    console.log(data)
    if(!data.is_admin){
        res.status(401).json(_response.error('Access Denied'))
    }
    
}).patch('/:bus_id',auth_check,(req,res) => {
    
})


module.exports = router