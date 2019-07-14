"use strict";

/* eslint-disable consistent-return */

/* eslint-disable no-underscore-dangle */
var express = require('express');

var router = express.Router();

var logger = require('logger').createLogger('./development.log');

var bcrypt = require('bcrypt');

var _require = require('express-validator'),
    check = _require.check,
    validationResult = _require.validationResult,
    body = _require.body;

var _require2 = require('express-validator'),
    sanitizeBody = _require2.sanitizeBody;

var _response = require('../helpers/response');

var db = require('../config/db');

var Utils = require('../helpers/utils');

var authCheck = require('../middlewares/auth_check'); // create a new user


router.post('/signup', [check('email').exists().withMessage('Email is required'), check('password').exists().withMessage('Password is required'), check('first_name').exists().withMessage('First name is required'), check('last_name').exists().withMessage('Last name is required'), body('email').not().isEmpty().escape().isEmail(), sanitizeBody('email').normalizeEmail().trim()], function (req, res) {
  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(404).json(_response.error(errors));
  } // logger.info({ errors, msg: 'User auth validation' });


  var _req$body = req.body,
      email = _req$body.email,
      password = _req$body.password,
      first_name = _req$body.first_name,
      last_name = _req$body.last_name;
  var isAdmin = true;
  var searchQuery = "SELECT * FROM users WHERE email = '".concat(email, "' ");
  db.query(searchQuery).then(function (resp) {
    if (resp.rowCount > 0) {
      res.status(403).json(_response.error('Email already exists'));
    } else {
      // find users
      db.query('SELECT * FROM users').then(function (users) {
        if (users.rowCount > 0) {
          isAdmin = false;
        }

        bcrypt.hash(password, 10, function (err, hash) {
          if (err) {
            res.status(500).json(_response.error(err));
          } else {
            var uniqui = Utils.randomString(200);
            var query = {
              text: 'INSERT INTO users(user_id,first_name,last_name,email,password,is_admin,address) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
              values: [uniqui.trimRight(), first_name, last_name, email, hash, isAdmin, 'somewhere']
            };
            db.query(query).then(function (respo) {
              var jwtdata = {
                email: respo.rows[0].email,
                user_id: respo.rows[0].user_id,
                is_admin: respo.rows[0].is_admin
              };
              var token = Utils.signToken(jwtdata);
              var data = {
                user_id: respo.rows[0].user_id,
                is_admin: respo.rows[0].is_admin,
                id: respo.rows[0].user_id,
                token: token
              };
              console.log("Created ".concat(JSON.stringify(data)));
              res.status(201).json(_response.success(data));
            })["catch"](function (e) {
              logger.error(e);
              res.status(500).json(_response.error('Something went wrong'));
            });
          }
        }); // logger.info(isAdmin);
      })["catch"](function (err) {
        logger.error(err);
        res.status(505).json(_response.error('Could not fetch users'));
      }); // end find users
    }
  })["catch"](function (err) {
    res.json(_response.error(err));
  }); // res.send(response.error('Something went wrong'))
}).post('/signin', body('email').not().isEmpty().escape().isEmail(), function (req, res) {
  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(403).send(_response.error(errors));
  }

  var _req$body2 = req.body,
      email = _req$body2.email,
      password = _req$body2.password;
  var searchQuery = "SELECT * FROM users WHERE email = '".concat(email, "'");
  db.query(searchQuery).then(function (resp) {
    if (resp.rowCount <= 0) {
      console.log("Email does not exist,check ".concat(email));
      res.status(402).json(_response.error('Email does not exist'));
    } // logger.info(`User ${resp.rows}`);


    bcrypt.compare(password, resp.rows[0].password).then(function () {
      var jwtdata = {
        email: resp.rows[0].email,
        user_id: resp.rows[0].user_id,
        is_admin: resp.rows[0].is_admin
      };
      var token = Utils.signToken(jwtdata);
      req.headers.authorization = "Bearer ".concat(token);
      var data = {
        user_id: resp.rows[0].user_id,
        is_admin: resp.rows[0].is_admin,
        id: resp.rows[0].user_id,
        token: token
      };
      res.status(200).json(_response.success(data));
    })["catch"](function (err) {
      logger.error("Bycrypt error ".concat(err));
      res.status(500).json(_response.error('Failed to compare passwords'));
    });
  });
}).post('/admin/:user_id', authCheck, function (req, res) {
  // make user an admin
  var toBeAdmin = req.params.user_id;
  var data = req.decoded.data;
  var admin = data.is_admin; // logger.info(admin);

  if (admin) {
    db.query("SELECT * FROM users WHERE user_id = '".concat(toBeAdmin, "' AND is_admin='", false, "'")).then(function (resp) {
      if (resp.rowCount > 0) {
        db.query("UPDATE users SET is_admin='".concat(true, "' WHERE user_id = '", toBeAdmin, "' RETURNING *")).then(function (newAdminData) {
          if (newAdminData.rowCount > 0) {
            res.status(200).json(_response.success(newAdminData.rows[0]));
          } else {
            res.status(500).json(_response.error('Failed to assign role'));
          }
        })["catch"](function () {
          res.status(401).json(_response.error('Opps! Something went wrong'));
        });
      } else {
        res.status(403).json(_response.error('Cannot re-assign role to user'));
      }
    })["catch"](function () {
      res.status(401).json(_response.error('Opps! Something went wrong'));
    });
  } else {
    res.status(505).json(_response.error('Your plans failed, we have a stronger algorithm'));
  }
});
module.exports = router;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9jb250cm9sbGVycy91c2VyLmpzIl0sIm5hbWVzIjpbImV4cHJlc3MiLCJyZXF1aXJlIiwicm91dGVyIiwiUm91dGVyIiwibG9nZ2VyIiwiY3JlYXRlTG9nZ2VyIiwiYmNyeXB0IiwiY2hlY2siLCJ2YWxpZGF0aW9uUmVzdWx0IiwiYm9keSIsInNhbml0aXplQm9keSIsIl9yZXNwb25zZSIsImRiIiwiVXRpbHMiLCJhdXRoQ2hlY2siLCJwb3N0IiwiZXhpc3RzIiwid2l0aE1lc3NhZ2UiLCJub3QiLCJpc0VtcHR5IiwiZXNjYXBlIiwiaXNFbWFpbCIsIm5vcm1hbGl6ZUVtYWlsIiwidHJpbSIsInJlcSIsInJlcyIsImVycm9ycyIsInN0YXR1cyIsImpzb24iLCJlcnJvciIsImVtYWlsIiwicGFzc3dvcmQiLCJmaXJzdF9uYW1lIiwibGFzdF9uYW1lIiwiaXNBZG1pbiIsInNlYXJjaFF1ZXJ5IiwicXVlcnkiLCJ0aGVuIiwicmVzcCIsInJvd0NvdW50IiwidXNlcnMiLCJoYXNoIiwiZXJyIiwidW5pcXVpIiwicmFuZG9tU3RyaW5nIiwidGV4dCIsInZhbHVlcyIsInRyaW1SaWdodCIsInJlc3BvIiwiand0ZGF0YSIsInJvd3MiLCJ1c2VyX2lkIiwiaXNfYWRtaW4iLCJ0b2tlbiIsInNpZ25Ub2tlbiIsImRhdGEiLCJpZCIsImNvbnNvbGUiLCJsb2ciLCJKU09OIiwic3RyaW5naWZ5Iiwic3VjY2VzcyIsImUiLCJzZW5kIiwiY29tcGFyZSIsImhlYWRlcnMiLCJhdXRob3JpemF0aW9uIiwidG9CZUFkbWluIiwicGFyYW1zIiwiZGVjb2RlZCIsImFkbWluIiwibmV3QWRtaW5EYXRhIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTtBQUNBLElBQU1BLE9BQU8sR0FBR0MsT0FBTyxDQUFDLFNBQUQsQ0FBdkI7O0FBRUEsSUFBTUMsTUFBTSxHQUFHRixPQUFPLENBQUNHLE1BQVIsRUFBZjs7QUFDQSxJQUFNQyxN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QUFDa0IsS0FBVixDQUFnQiw0QkFBaEIsQ0FBckI7QUFDRCxLQWhCRDtBQWlCRCxHQWxCRCxNQWtCTztBQUNMSixJQUFBQSxHQUFHLENBQUNFLE1BQUosQ0FBVyxHQUFYLEVBQWdCQyxJQUFoQixDQUFxQmpCLFNBQVMsQ0FBQ2tCLEtBQVYsQ0FBZ0IsaURBQWhCLENBQXJCO0FBQ0Q7QUFDRixDQWhKRDtBQWtKQTJDLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQnZFLE1BQWpCIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgY29uc2lzdGVudC1yZXR1cm4gKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVyc2NvcmUtZGFuZ2xlICovXG5jb25zdCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnbG9nZ2VyJykuY3JlYXRlTG9nZ2VyKCcuL2RldmVsb3BtZW50LmxvZycpO1xuXG5cbmNvbnN0IGJjcnlwdCA9IHJlcXVpcmUoJ2JjcnlwdCcpO1xuY29uc3Qge1xuICBjaGVjayxcbiAgdmFsaWRhdGlvblJlc3VsdCwgYm9keSxcbn0gPSByZXF1aXJlKCdleHByZXNzLXZhbGlkYXRvcicpO1xuXG5jb25zdCB7XG4gIHNhbml0aXplQm9keSxcbn0gPSByZXF1aXJlKCdleHByZXNzLXZhbGlkYXRvcicpO1xuY29uc3QgX3Jlc3BvbnNlID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZXNwb25zZScpO1xuY29uc3QgZGIgPSByZXF1aXJlKCcuLi9jb25maWcvZGInKTtcbmNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi4vaGVscGVycy91dGlscycpO1xuY29uc3QgYXV0aENoZWNrID0gcmVxdWlyZSgnLi4vbWlkZGxld2FyZXMvYXV0aF9jaGVjaycpO1xuXG4vLyBjcmVhdGUgYSBuZXcgdXNlclxucm91dGVyLnBvc3QoJy9zaWdudXAnLFxuICBbXG4gICAgY2hlY2soJ2VtYWlsJykuZXhpc3RzKCkud2l0aE1lc3NhZ2UoJ0VtYWlsIGlzIHJlcXVpcmVkJyksXG4gICAgY2hlY2soJ3Bhc3N3b3JkJykuZXhpc3RzKCkud2l0aE1lc3NhZ2UoJ1Bhc3N3b3JkIGlzIHJlcXVpcmVkJyksXG4gICAgY2hlY2soJ2ZpcnN0X25hbWUnKS5leGlzdHMoKS53aXRoTWVzc2FnZSgnRmlyc3QgbmFtZSBpcyByZXF1aXJlZCcpLFxuICAgIGNoZWNrKCdsYXN0X25hbWUnKS5leGlzdHMoKS53aXRoTWVzc2FnZSgnTGFzdCBuYW1lIGlzIHJlcXVpcmVkJyksXG4gICAgYm9keSgnZW1haWwnKS5ub3QoKS5pc0VtcHR5KCkuZXNjYXBlKClcbiAgICAgIC5pc0VtYWlsKCksXG4gICAgc2FuaXRpemVCb2R5KCdlbWFpbCcpLm5vcm1hbGl6ZUVtYWlsKCkudHJpbSgpLFxuICBdLCAocmVxLCByZXMpID0+IHtcbiAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oX3Jlc3BvbnNlLmVycm9yKGVycm9ycykpO1xuICAgIH1cbiAgICAvLyBsb2dnZXIuaW5mbyh7IGVycm9ycywgbXNnOiAnVXNlciBhdXRoIHZhbGlkYXRpb24nIH0pO1xuICAgIGNvbnN0IHtcbiAgICAgIGVtYWlsLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBmaXJzdF9uYW1lLFxuICAgICAgbGFzdF9uYW1lLFxuICAgIH0gPSByZXEuYm9keTtcbiAgICBsZXQgaXNBZG1pbiA9IHRydWU7XG4gICAgY29uc3Qgc2VhcmNoUXVlcnkgPSBgU0VMRUNUICogRlJPTSB1c2VycyBXSEVSRSBlbWFpbCA9ICcke2VtYWlsfScgYDtcblxuICAgIGRiLnF1ZXJ5KHNlYXJjaFF1ZXJ5KS50aGVuKChyZXNwKSA9PiB7XG4gICAgICBpZiAocmVzcC5yb3dDb3VudCA+IDApIHtcbiAgICAgICAgcmVzLnN0YXR1cyg0MDMpLmpzb24oX3Jlc3BvbnNlLmVycm9yKCdFbWFpbCBhbHJlYWR5IGV4aXN0cycpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGZpbmQgdXNlcnNcbiAgICAgICAgZGIucXVlcnkoJ1NFTEVDVCAqIEZST00gdXNlcnMnKS50aGVuKCh1c2VycykgPT4ge1xuICAgICAgICAgIGlmICh1c2Vycy5yb3dDb3VudCA+IDApIHtcbiAgICAgICAgICAgIGlzQWRtaW4gPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYmNyeXB0Lmhhc2gocGFzc3dvcmQsIDEwLCAoZXJyLCBoYXNoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKF9yZXNwb25zZS5lcnJvcihlcnIpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IHVuaXF1aSA9IFV0aWxzLnJhbmRvbVN0cmluZygyMDApO1xuICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9IHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAnSU5TRVJUIElOVE8gdXNlcnModXNlcl9pZCxmaXJzdF9uYW1lLGxhc3RfbmFtZSxlbWFpbCxwYXNzd29yZCxpc19hZG1pbixhZGRyZXNzKSBWQUxVRVMoJDEsJDIsJDMsJDQsJDUsJDYsJDcpIFJFVFVSTklORyAqJyxcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IFt1bmlxdWkudHJpbVJpZ2h0KCksIGZpcnN0X25hbWUsIGxhc3RfbmFtZSwgZW1haWwsIGhhc2gsIGlzQWRtaW4sICdzb21ld2hlcmUnXSxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgZGIucXVlcnkocXVlcnkpXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvKSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBqd3RkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBlbWFpbDogcmVzcG8ucm93c1swXS5lbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogcmVzcG8ucm93c1swXS51c2VyX2lkLFxuICAgICAgICAgICAgICAgICAgICBpc19hZG1pbjogcmVzcG8ucm93c1swXS5pc19hZG1pbixcbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICBjb25zdCB0b2tlbiA9IFV0aWxzLnNpZ25Ub2tlbihqd3RkYXRhKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6IHJlc3BvLnJvd3NbMF0udXNlcl9pZCxcbiAgICAgICAgICAgICAgICAgICAgaXNfYWRtaW46IHJlc3BvLnJvd3NbMF0uaXNfYWRtaW4sXG4gICAgICAgICAgICAgICAgICAgIGlkOiByZXNwby5yb3dzWzBdLnVzZXJfaWQsXG4gICAgICAgICAgICAgICAgICAgIHRva2VuLFxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDcmVhdGVkICR7SlNPTi5zdHJpbmdpZnkoZGF0YSl9YCk7XG4gICAgICAgICAgICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihfcmVzcG9uc2Uuc3VjY2VzcyhkYXRhKSk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKF9yZXNwb25zZS5lcnJvcignU29tZXRoaW5nIHdlbnQgd3JvbmcnKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gbG9nZ2VyLmluZm8oaXNBZG1pbik7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICByZXMuc3RhdHVzKDUwNSkuanNvbihfcmVzcG9uc2UuZXJyb3IoJ0NvdWxkIG5vdCBmZXRjaCB1c2VycycpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGVuZCBmaW5kIHVzZXJzXG4gICAgICB9XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgcmVzLmpzb24oX3Jlc3BvbnNlLmVycm9yKGVycikpO1xuICAgIH0pO1xuXG5cbiAgICAvLyByZXMuc2VuZChyZXNwb25zZS5lcnJvcignU29tZXRoaW5nIHdlbnQgd3JvbmcnKSlcbiAgfSkucG9zdCgnL3NpZ25pbicsIGJvZHkoJ2VtYWlsJykubm90KCkuaXNFbXB0eSgpLmVzY2FwZSgpXG4gIC5pc0VtYWlsKCksXG4ocmVxLCByZXMpID0+IHtcbiAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDMpLnNlbmQoX3Jlc3BvbnNlLmVycm9yKGVycm9ycykpO1xuICB9XG4gIGNvbnN0IHtcbiAgICBlbWFpbCxcbiAgICBwYXNzd29yZCxcbiAgfSA9IHJlcS5ib2R5O1xuICBjb25zdCBzZWFyY2hRdWVyeSA9IGBTRUxFQ1QgKiBGUk9NIHVzZXJzIFdIRVJFIGVtYWlsID0gJyR7ZW1haWx9J2A7XG5cbiAgZGIucXVlcnkoc2VhcmNoUXVlcnkpLnRoZW4oKHJlc3ApID0+IHtcbiAgICBpZiAocmVzcC5yb3dDb3VudCA8PSAwKSB7XG4gICAgICBjb25zb2xlLmxvZyhgRW1haWwgZG9lcyBub3QgZXhpc3QsY2hlY2sgJHtlbWFpbH1gKTtcbiAgICAgIHJlcy5zdGF0dXMoNDAyKS5qc29uKF9yZXNwb25zZS5lcnJvcignRW1haWwgZG9lcyBub3QgZXhpc3QnKSk7XG4gICAgfVxuICAgIC8vIGxvZ2dlci5pbmZvKGBVc2VyICR7cmVzcC5yb3dzfWApO1xuICAgIGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCByZXNwLnJvd3NbMF0ucGFzc3dvcmQpLnRoZW4oKCkgPT4ge1xuICAgICAgY29uc3Qgand0ZGF0YSA9IHtcbiAgICAgICAgZW1haWw6IHJlc3Aucm93c1swXS5lbWFpbCxcbiAgICAgICAgdXNlcl9pZDogcmVzcC5yb3dzWzBdLnVzZXJfaWQsXG4gICAgICAgIGlzX2FkbWluOiByZXNwLnJvd3NbMF0uaXNfYWRtaW4sXG4gICAgICB9O1xuICAgICAgY29uc3QgdG9rZW4gPSBVdGlscy5zaWduVG9rZW4oand0ZGF0YSk7XG4gICAgICByZXEuaGVhZGVycy5hdXRob3JpemF0aW9uID0gYEJlYXJlciAke3Rva2VufWA7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICB1c2VyX2lkOiByZXNwLnJvd3NbMF0udXNlcl9pZCxcbiAgICAgICAgaXNfYWRtaW46IHJlc3Aucm93c1swXS5pc19hZG1pbixcbiAgICAgICAgaWQ6IHJlc3Aucm93c1swXS51c2VyX2lkLFxuICAgICAgICB0b2tlbixcbiAgICAgIH07XG4gICAgICByZXMuc3RhdHVzKDIwMCkuanNvbihfcmVzcG9uc2Uuc3VjY2VzcyhkYXRhKSk7XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgbG9nZ2VyLmVycm9yKGBCeWNyeXB0IGVycm9yICR7ZXJyfWApO1xuICAgICAgcmVzLnN0YXR1cyg1MDApLmpzb24oX3Jlc3BvbnNlLmVycm9yKCdGYWlsZWQgdG8gY29tcGFyZSBwYXNzd29yZHMnKSk7XG4gICAgfSk7XG4gIH0pO1xufSkucG9zdCgnL2FkbWluLzp1c2VyX2lkJywgYXV0aENoZWNrLCAocmVxLCByZXMpID0+IHtcbiAgLy8gbWFrZSB1c2VyIGFuIGFkbWluXG4gIGNvbnN0IHRvQmVBZG1pbiA9IHJlcS5wYXJhbXMudXNlcl9pZDtcbiAgY29uc3QgeyBkYXRhIH0gPSByZXEuZGVjb2RlZDtcbiAgY29uc3QgYWRtaW4gPSBkYXRhLmlzX2FkbWluO1xuXG4gIC8vIGxvZ2dlci5pbmZvKGFkbWluKTtcbiAgaWYgKGFkbWluKSB7XG4gICAgZGIucXVlcnkoYFNFTEVDVCAqIEZST00gdXNlcnMgV0hFUkUgdXNlcl9pZCA9ICcke3RvQmVBZG1pbn0nIEFORCBpc19hZG1pbj0nJHtmYWxzZX0nYCkudGhlbigocmVzcCkgPT4ge1xuICAgICAgaWYgKHJlc3Aucm93Q291bnQgPiAwKSB7XG4gICAgICAgIGRiLnF1ZXJ5KGBVUERBVEUgdXNlcnMgU0VUIGlzX2FkbWluPScke3RydWV9JyBXSEVSRSB1c2VyX2lkID0gJyR7dG9CZUFkbWlufScgUkVUVVJOSU5HICpgKS50aGVuKChuZXdBZG1pbkRhdGEpID0+IHtcbiAgICAgICAgICBpZiAobmV3QWRtaW5EYXRhLnJvd0NvdW50ID4gMCkge1xuICAgICAgICAgICAgcmVzLnN0YXR1cygyMDApLmpzb24oX3Jlc3BvbnNlLnN1Y2Nlc3MobmV3QWRtaW5EYXRhLnJvd3NbMF0pKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLmpzb24oX3Jlc3BvbnNlLmVycm9yKCdGYWlsZWQgdG8gYXNzaWduIHJvbGUnKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgcmVzLnN0YXR1cyg0MDEpLmpzb24oX3Jlc3BvbnNlLmVycm9yKCdPcHBzISBTb21ldGhpbmcgd2VudCB3cm9uZycpKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXMuc3RhdHVzKDQwMykuanNvbihfcmVzcG9uc2UuZXJyb3IoJ0Nhbm5vdCByZS1hc3NpZ24gcm9sZSB0byB1c2VyJykpO1xuICAgICAgfVxuICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgIHJlcy5zdGF0dXMoNDAxKS5qc29uKF9yZXNwb25zZS5lcnJvcignT3BwcyEgU29tZXRoaW5nIHdlbnQgd3JvbmcnKSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmVzLnN0YXR1cyg1MDUpLmpzb24oX3Jlc3BvbnNlLmVycm9yKCdZb3VyIHBsYW5zIGZhaWxlZCwgd2UgaGF2ZSBhIHN0cm9uZ2VyIGFsZ29yaXRobScpKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm91dGVyO1xuIl19