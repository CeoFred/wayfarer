"use strict";

/* eslint-disable consistent-return */

/* eslint-disable no-underscore-dangle */
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

var Utils = require('../helpers/utils'); // create a new user


router.post('/signup', [check('email').exists().withMessage('Email is required'), check('password').exists().withMessage('Password is required'), check('firstName').exists().withMessage('First name is required'), check('lastName').exists().withMessage('Last name is required'), body('email').not().isEmpty().escape().isEmail(), sanitizeBody('email').normalizeEmail().trim()], function (req, res) {
  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(404).json(_response.error(errors));
  }

  var _req$body = req.body,
      email = _req$body.email,
      password = _req$body.password,
      firstName = _req$body.firstName,
      lastName = _req$body.lastName; // console.log(email)

  var searchQuery = "SELECT * FROM users WHERE email = '".concat(email, "' ");
  db.query(searchQuery).then(function (resp) {
    if (resp.rowCount > 0) {
      res.status(403).json(_response.error('Email already exists'));
    } else {
      bcrypt.hash(password, 10, function (err, hash) {
        if (err) {
          res.status(500).json(_response.error(err));
        } else {
          var uniqui = Utils.randomString(200);
          var query = {
            text: 'INSERT INTO users(user_id,first_name,last_name,email,password,is_admin,address) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
            values: [uniqui.trimRight(), firstName, lastName, email, hash, true, 'somewhere']
          };
          db.query(query).then(function (respo) {
            var token = jwt.sign({
              data: {
                email: respo.rows[0].email,
                userId: respo.rows[0].user_id,
                is_admin: respo.rows[0].is_admin
              }
            }, process.env.JWT_SIGNATURE, {
              expiresIn: '7d',
              mutatePayload: true
            });
            var data = {
              user_id: respo.rows[0].user_id,
              is_admin: respo.rows[0].is_admin,
              token: token
            };
            res.status(201).json(_response.success(data));
          })["catch"](function (e) {
            res.status(500).json(_response.error('Something went wrong'));
            throw e;
          });
        }
      });
    }
  })["catch"](function (err) {
    res.json(_response.error(err));
    throw err;
  }); // res.send(response.error('Something went wrong'))
}).post('/login', check('email').isEmail().withMessage('A valid email is required to signin'), function (req, res) {
  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.send(_response.error(errors));
  }

  var _req$body2 = req.body,
      email = _req$body2.email,
      password = _req$body2.password;
  var searchQuery = "SELECT password,user_id,is_admin FROM users WHERE email = '".concat(email, "' LIMIT 1");
  db.query(searchQuery).then(function (resp) {
    if (resp.rowCount <= 0) {
      res.status(403).json(_response.error('Email does not exist'));
    }

    bcrypt.compare(password, resp.rows[0].password, function (err, result) {
      // res == true
      if (err) {
        return res.status(401).json(_response.error('Failed with code x(2e2x)'));
      }

      if (result) {
        var token = jwt.sign({
          data: {
            email: resp.rows[0].email,
            userId: resp.rows[0].user_id,
            is_admin: resp.rows[0].is_admin
          }
        }, process.env.JWT_SIGNATURE, {
          expiresIn: '7d',
          mutatePayload: true
        });
        req.headers.authorization = "Bearer ".concat(token);
        var data = {
          user_id: resp.rows[0].user_id,
          is_admin: resp.rows[0].is_admin,
          token: token
        };
        return res.status(200).json(_response.success(data));
      }
    });
  });
});
module.exports = router;
//# sourceMappingURL=user.js.map