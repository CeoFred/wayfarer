/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import express from 'express';
import logger from 'logger';
import bcrypt from 'bcryptjs';

const log = logger.createLogger('./development.log');

const router = express.Router();
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

const salt = bcrypt.genSaltSync(10);
// create a new user
router.post('/signup',
  [
    check('email').exists().withMessage('Email is required'),
    check('password').exists().withMessage('Password is required'),
    check('first_name').exists().withMessage('First name is required'),
    check('last_name').exists().withMessage('Last name is required'),
    body('email').not().isEmpty().escape()
      .isEmail(),
    sanitizeBody('email').normalizeEmail().trim(),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(404).json(_response.error(errors));
    }
    // logger.info({ errors, msg: 'User auth validation' });
    const {
      email,
      password,
      first_name,
      last_name,
    } = req.body;
    let isAdmin = true;
    const searchQuery = `SELECT * FROM users WHERE email = '${email}' `;

    db.query(searchQuery).then((resp) => {
      if (resp.rowCount > 0) {
        res.status(403).json(_response.error('Email already exists'));
      } else {
        // find users
        db.query('SELECT * FROM users').then((users) => {
          if (users.rowCount > 0) {
            isAdmin = false;
          }


          bcrypt.hash(password, salt).then((hash) => {
            const uniqui = Utils.randomString(200);
            const query = {
              text: 'INSERT INTO users(user_id,first_name,last_name,email,password,is_admin,address) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
              values: [uniqui.trimRight(), first_name, last_name, email, hash, isAdmin, 'somewhere'],
            };
            db.query(query)
              .then((respo) => {
                const jwtdata = {
                  email: respo.rows[0].email,
                  user_id: respo.rows[0].user_id,
                  is_admin: respo.rows[0].is_admin,
                  id: respo.rows[0].user_id,

                };
                const token = Utils.signToken(jwtdata);
                const data = {
                  user_id: respo.rows[0].user_id,
                  is_admin: respo.rows[0].is_admin,
                  id: respo.rows[0].user_id,
                  token,
                };
                console.log(`Created ${JSON.stringify(data)}`);
                res.status(201).json(_response.success(data));
              }).catch((e) => {
                return e;
              }).catch((e) => {
                log.error(e);
                res.status(500).json(_response.error('Something went wrong'));
              });
          }).catch((err) => {
            return res.status(500).json(_response.error(err));
          });


          // log.info(isAdmin);
        }).catch((err) => {
          log.error(err);
          res.status(505).json(_response.error('Could not fetch users'));
        });
        // end find users
      }
    }).catch((err) => {
      res.json(_response.error(err));
    });


    // res.send(response.error('Something went wrong'))
  }).post('/signin', [body('email').not().isEmpty().escape()
  .isEmail(),
body('password').not().isEmpty(),
check('email').exists().withMessage('Email is required'),
check('password').exists().withMessage('Password is required')],
(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(403).send(_response.error(errors));
  }
  const {
    email,
    password,
  } = req.body;
  const searchQuery = `SELECT * FROM users WHERE email = '${email.toLowerCase()}'`;

  db.query(searchQuery).then((resp) => {
    if (resp.rowCount <= 0) {
      console.log(`Email does not exist,check ${email}`);
      return res.status(402).json(_response.error('Email does not exist'));
    }

    bcrypt.compare(password ? password.toLowerCase() : null, resp.rows[0].password).then((respo) => {
      if (respo !== true) {
        return res.status(403).json(_response.error('Passwords do not match'));
      }
      const jwtdata = {
        email: resp.rows[0].email,
        user_id: resp.rows[0].user_id,
        is_admin: resp.rows[0].is_admin,
        id: resp.rows[0].user_id,
      };
      const token = Utils.signToken(jwtdata);
      req.headers.authorization = `Bearer ${token}`;
      const data = {
        user_id: resp.rows[0].user_id,
        is_admin: resp.rows[0].is_admin,
        id: resp.rows[0].user_id,
        token,
      };
      res.status(200).json(_response.success(data));
    }).catch((err) => {
      log.error(`Bycrypt error ${err}`);
      return res.status(500).json(_response.error('Failed to compare passwords'));
    });
  });
}).post('/admin/:user_id', authCheck, (req, res) => {
  // make user an admin
  const toBeAdmin = req.params.user_id;
  const { data } = req.decoded;
  const admin = data.is_admin;

  // log.info(admin);
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
