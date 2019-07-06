"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var jwt = require('jsonwebtoken'); // eslint-disable-next-line no-underscore-dangle


var _response = require('../helpers/response');

module.exports = function (req, res, next) {
  var rtoken;

  if (req.body.token) {
    var _req$body = _slicedToArray(req.body, 1),
        token = _req$body[0];

    rtoken = token;
  } else if (req.param.token) {
    var _res$param = _slicedToArray(res.param, 1),
        _token = _res$param[0];

    rtoken = _token;
  } else if (req.headers.authorization) {
    // eslint-disable-next-line prefer-destructuring
    rtoken = req.headers.authorization.split(' ')[1];
  } // check if an authtorization headeer exixsts


  try {
    var decoded = jwt.verify(rtoken, 'p2456653RDFBNYH2R31324354YT43');
    req.usertoken = jwt.decode(rtoken);
    req.decoded = decoded;
  } catch (err) {
    return res.status(401).json(_response.error('Token Authentication Failed'));
  }

  return next();
};
//# sourceMappingURL=auth_check.js.map