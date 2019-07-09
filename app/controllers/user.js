/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const express = require('express');

const router = express.Router();


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  check,
  validationResult, body,
} = require('express-validator');

const {
  sanitizeBody,
} = require('express-validator');
const _response = require('../helpers/response');
const db = require('../config/db');
const Utils = require('../helpers/utils');
const authCheck = require('../middlewares/auth_check');

// create a new user
router.post('/signup',
  [
    check('email').exists().withMessage('Email is required'),
    check('password').exists().withMessage('Password is required'),
    check('firstName').exists().withMessage('First name is required'),
    check('lastName').exists().withMessage('Last name is required'),
    body('email').not().isEmpty().escape()
      .isEmail(),
    sanitizeBody('email').normalizeEmail().trim(),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json(_response.error(errors));
    }
    const {
      email,
      password,
      firstName,
      lastName,
    } = req.body;

    // console.log(email)
    const searchQuery = `SELECT * FROM users WHERE email = '${email}' `;

    db.query(searchQuery).then((resp) => {
      if (resp.rowCount > 0) {
        res.status(403).json(_response.error('Email already exists'));
      } else {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            res.status(500).json(_response.error(err));
          } else {
            const uniqui = Utils.randomString(200);
            const query = {
              text: 'INSERT INTO users(user_id,first_name,last_name,email,password,is_admin,address) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
              values: [uniqui.trimRight(), firstName, lastName, email, hash, false, 'somewhere'],
            };
            db.query(query)
              .then((respo) => {
                const token = jwt.sign({
                  data: {
                    email: respo.rows[0].email,
                    userId: respo.rows[0].user_id,
                    is_admin: respo.rows[0].is_admin,
                  },
                },
                process.env.JWT_SIGNATURE,
                {
                  expiresIn: '7d',
                  mutatePayload: true,
                });
                const data = {
                  user_id: respo.rows[0].user_id,
                  is_admin: respo.rows[0].is_admin,
                  token,
                };
                res.status(201).json(_response.success(data));
              }).catch((e) => {
                res.status(500).json(_response.error('Something went wrong'));
                throw e;
              });
          }
        });
      }
    }).catch((err) => {
      res.json(_response.error(err));
      throw err;
    });


    // res.send(response.error('Something went wrong'))
  }).post('/login',
  check('email').isEmail().withMessage('A valid email is required to signin'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send(_response.error(errors));
    }
    const {
      email,
      password,
    } = req.body;
    const searchQuery = `SELECT password,user_id,is_admin FROM users WHERE email = '${email}' LIMIT 1`;

    db.query(searchQuery).then((resp) => {
      if (resp.rowCount <= 0) {
        res.status(403).json(_response.error('Email does not exist'));
      }

      bcrypt.compare(password, resp.rows[0].password, (err, result) => {
        // res == true
        if (err) {
          return res.status(401).json(_response.error('Failed with code x(2e2x)'));
        }
        if (result) {
          const token = jwt.sign({
            data: {
              email: resp.rows[0].email,
              userId: resp.rows[0].user_id,
              is_admin: resp.rows[0].is_admin,
            },
          },
          process.env.JWT_SIGNATURE,
          {
            expiresIn: '7d',
            mutatePayload: true,
          });
          req.headers.authorization = `Bearer ${token}`;
          const data = {
            user_id: resp.rows[0].user_id,
            is_admin: resp.rows[0].is_admin,
            token,
          };
          return res.status(200).json(_response.success(data));
        }
      });
    });
  }).post('/admin/:userId', authCheck, (req, res) => {
  // make user an admin
  const toBeAdmin = req.params.userId;
  const { data } = req.decoded;
  const admin = data.is_admin;


  if (admin) {
    db.query(`SELECT * FROM users WHERE user_id = '${toBeAdmin}' AND is_admin='${false}'`).then((resp) => {
      if (resp.rowCount > 0) {
        db.query(`UPDATE users SET is_admin='${true}' WHERE user_id = '${toBeAdmin}' RETURNING *`).then((newAdminData) => {
          if (newAdminData.rowCount > 0) {
            res.status(200).json(_response.success(newAdminData.rows[0]));
          } else {
            res.status(500).json(_response.error('Failed to assign role'));
          }
        }).catch(() => {
          res.status(401).json(_response.error('Opps! Something went wrong'));
        });
      } else {
        res.status(403).json(_response.error('Cannot re-assign role to user'));
      }
    }).catch(() => {
      res.status(401).json(_response.error('Opps! Something went wrong'));
    });
  } else {
    res.status(505).json(_response.error('Your plans failed, we have a stronger algorithm'));
  }
});

module.exports = router;
