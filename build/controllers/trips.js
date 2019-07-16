"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { keys.push.apply(keys, Object.getOwnPropertySymbols(object)); } if (enumerableOnly) keys = keys.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var express = require('express');

var logger = require('logger').createLogger('./development.log');

var router = express.Router();

var _require = require('express-validator'),
    check = _require.check,
    validationResult = _require.validationResult,
    body = _require.body;

var response = require('../helpers/response');

var db = require('../config/db');

var Utils = require('../helpers/utils');

var authCheck = require('../middlewares/auth_check');

router.post('/', authCheck, [check('origin').exists().withMessage('origin is required'), body('origin').not().isEmpty().escape(), check('destination').exists().withMessage('destination is required'), body('destination').not().isEmpty().escape(), check('fare').exists().withMessage('fare is required'), body('fare').not().isEmpty().escape(), check('trip_date').exists().withMessage('trip Date is required'), body('trip_date').not().isEmpty().escape()], function (req, res) {
  // new trip
  var errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(403).json(response.error(errors));
  }

  var _req$body = req.body,
      origin = _req$body.origin,
      destination = _req$body.destination,
      fare = _req$body.fare,
      trip_date = _req$body.trip_date;
  var data = req.decoded.data;
  console.log(data);

  if (!data.is_admin) {
    res.status(401).json(response.error('Access Denied'));
  }

  var uniqui = Utils.randomString(200);
  var query = {
    text: 'INSERT INTO trips(user_id,origin,destination,trip_date,fare,trip_id,status) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    values: [data.user_id, origin, destination, trip_date, fare, uniqui, 'Active']
  };
  db.query(query).then(function (resp) {
    var trip_data = null;
    trip_data = _objectSpread({}, resp.rows[0], {
      id: resp.rows[0].trip_id
    });
    res.status(201).json(response.success(trip_data));
  })["catch"](function (err) {
    console.log(err);
    res.status(500).json(response.error('Something went wrong'));
  });
}).get('/', function (req, res) {
  // get all trips available
  db.query("SELECT * FROM trips WHERE status = 'Active' ").then(function (resp) {
    res.status(200).json(response.success(resp.rows));
  })["catch"](function (err) {
    logger.error(err);
    console.log(JSON.stringify(err));
    res.status(500).json(response.error('Failed to fetch trips'));
  });
}).patch('/:tripId', authCheck, function (req, res) {
  // cancel a trip
  var tripId = req.params.tripId;
  var data = req.decoded.data;

  if (!data.is_admin) {
    res.status(401).json(response.error('Access Denied'));
  }

  db.query("SELECT * FROM trips WHERE status = 'Active' AND trip_id = '".concat(tripId, "' ")).then(function (resp) {
    if (resp.rowCount <= 0) {
      res.status(404).json(response.error('Trip Not found'));
    } else {
      db.query("UPDATE trips SET status = 'cancelled' WHERE trip_id = '".concat(tripId, "' AND status = 'Active'")).then(function (busData) {
        res.status(200).json(response.success({
          message: 'Trip cancelled successfully',
          busData: busData
        }));
      })["catch"](function (err) {
        res.status(500).json(response.error({
          message: 'Trip failed to cancel'
        }));
        logger.error({
          err: err,
          message: 'while canceling trip'
        });
      });
    }
  })["catch"](function (err) {
    logger.error(err);
    res.status(500).json(response.error('Failed to fetch trips'));
  });
});
module.exports = router;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9jb250cm9sbGVycy90cmlwcy5qcyJdLCJuYW1lcyI6WyJleHByZXNzIiwicmVxdWlyZSIsImxvZ2dlciIsImNyZWF0ZUxvZ2dlciIsInJvdXRlciIsIlJvdXRlciIsImNoZWNrIiwidmFsaWRhdGlvblJlc3VsdCIsImJvZHkiLCJyZXNwb25zZSIsImRiIiwiVXRpbHMiLCJhdXRoQ2hlY2siLCJwb3N0IiwiZXhpc3RzIiwid2l0aE1lc3NhZ2UiLCJub3QiLCJpc0VtcHR5IiwiZXNjYXBlIiwicmVxIiwicmVzIiwiZXJyb3JzIiwic3RhdHVzIiwianNvbiIsImVycm9yIiwib3JpZ2luIiwiZGVzdGluYXRpb24iLCJmYXJlIiwidHJpcF9kYXRlIiwiZGF0YSIsImRlY29kZWQiLCJjb25zb2xlIiwibG9nIiwiaXNfYWRtaW4iLCJ1bmlxdWkiLCJyYW5kb21TdHJpbmciLCJxdWVyeSIsInRleHQiLCJ2YWx1ZXMiLCJ1c2VyX2lkIiwidGhlbiIsInJlc3AiLCJ0cmlwX2RhdGEiLCJyb3dzIiwiaWQiLCJ0cmlwX2lkIiwic3VjY2VzcyIsImVyciIsImdldCIsIkpTT04iLCJzdHJpbmdpZnkiLCJwYXRjaCIsInRyaXBJZCIsInBhcmFtcyIsInJvd0NvdW50IiwiYnVzRGF0YSIsIm1lc3NhZ2UiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLElBQU1BLE9BQU8sR0FBR0MsT0FBTyxDQUFDLFNBQUQsQ0FBdkI7O0FBQ0EsSUFBTUMsTUFBTSxHQUFHRCxPQUFPLENBQUMsUUFBRCxDQUFQLENBQWtCRSxZQUFsQixDQUErQixtQkFBL0IsQ0FBZjs7QUFFQSxJQUFNQyxNQUFNLEdBQUdKLE9BQU8sQ0FBQ0ssTUFBUixFQUFmOztlQUlJSixPQUFPLENBQUMsbUJBQUQsQztJQUZUSyxLLFlBQUFBLEs7SUFDQUMsZ0IsWUFBQUEsZ0I7SUFBa0JDLEksWUFBQUEsSTs7QUFFcEIsSUFBTUMsUUFBUSxHQUFHUixPQUFPLENBQUMs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QUcsRUFBSEEsR0FBRjtBQUFPUyxVQUFBQSxPQUFPLEVBQUU7QUFBaEIsU0FBYjtBQUNELE9BTEQ7QUFNRDtBQUNGLEdBWEQsV0FXUyxVQUFDVCxHQUFELEVBQVM7QUFDaEI3QyxJQUFBQSxNQUFNLENBQUNzQixLQUFQLENBQWF1QixHQUFiO0FBRUEzQixJQUFBQSxHQUFHLENBQUNFLE1BQUosQ0FBVyxHQUFYLEVBQWdCQyxJQUFoQixDQUFxQmQsUUFBUSxDQUFDZSxLQUFULENBQWUsdUJBQWYsQ0FBckI7QUFDRCxHQWZEO0FBZ0JELENBOUVEO0FBZ0ZBaUMsTUFBTSxDQUFDQyxPQUFQLEdBQWlCdEQsTUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnbG9nZ2VyJykuY3JlYXRlTG9nZ2VyKCcuL2RldmVsb3BtZW50LmxvZycpO1xuXG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuY29uc3Qge1xuICBjaGVjayxcbiAgdmFsaWRhdGlvblJlc3VsdCwgYm9keSxcbn0gPSByZXF1aXJlKCdleHByZXNzLXZhbGlkYXRvcicpO1xuY29uc3QgcmVzcG9uc2UgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3Jlc3BvbnNlJyk7XG5jb25zdCBkYiA9IHJlcXVpcmUoJy4uL2NvbmZpZy9kYicpO1xuY29uc3QgVXRpbHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3V0aWxzJyk7XG5cbmNvbnN0IGF1dGhDaGVjayA9IHJlcXVpcmUoJy4uL21pZGRsZXdhcmVzL2F1dGhfY2hlY2snKTtcblxucm91dGVyLnBvc3QoJy8nLCBhdXRoQ2hlY2ssIFtcbiAgY2hlY2soJ29yaWdpbicpLmV4aXN0cygpLndpdGhNZXNzYWdlKCdvcmlnaW4gaXMgcmVxdWlyZWQnKSxcbiAgYm9keSgnb3JpZ2luJykubm90KCkuaXNFbXB0eSgpLmVzY2FwZSgpLFxuXG4gIGNoZWNrKCdkZXN0aW5hdGlvbicpLmV4aXN0cygpLndpdGhNZXNzYWdlKCdkZXN0aW5hdGlvbiBpcyByZXF1aXJlZCcpLFxuICBib2R5KCdkZXN0aW5hdGlvbicpLm5vdCgpLmlzRW1wdHkoKS5lc2NhcGUoKSxcbiAgY2hlY2soJ2ZhcmUnKS5leGlzdHMoKS53aXRoTWVzc2FnZSgnZmFyZSBpcyByZXF1aXJlZCcpLFxuICBib2R5KCdmYXJlJykubm90KCkuaXNFbXB0eSgpLmVzY2FwZSgpLFxuXG4gIGNoZWNrKCd0cmlwX2RhdGUnKS5leGlzdHMoKS53aXRoTWVzc2FnZSgndHJpcCBEYXRlIGlzIHJlcXVpcmVkJyksXG4gIGJvZHkoJ3RyaXBfZGF0ZScpLm5vdCgpLmlzRW1wdHkoKS5lc2NhcGUoKSxcbl0sIChyZXEsIHJlcykgPT4ge1xuICAvLyBuZXcgdHJpcFxuICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgIHJlcy5zdGF0dXMoNDAzKS5qc29uKHJlc3BvbnNlLmVycm9yKGVycm9ycykpO1xuICB9XG4gIGNvbnN0IHtcbiAgICBvcmlnaW4sXG4gICAgZGVzdGluYXRpb24sXG4gICAgZmFyZSxcbiAgICB0cmlwX2RhdGUsXG5cbiAgfSA9IHJlcS5ib2R5O1xuICBjb25zdCB7IGRhdGEgfSA9IHJlcS5kZWNvZGVkO1xuICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgaWYgKCFkYXRhLmlzX2FkbWluKSB7XG4gICAgcmVzLnN0YXR1cyg0MDEpLmpzb24ocmVzcG9uc2UuZXJyb3IoJ0FjY2VzcyBEZW5pZWQnKSk7XG4gIH1cblxuICBjb25zdCB1bmlxdWkgPSBVdGlscy5yYW5kb21TdHJpbmcoMjAwKTtcblxuICBjb25zdCBxdWVyeSA9IHtcbiAgICB0ZXh0OiAnSU5TRVJUIElOVE8gdHJpcHModXNlcl9pZCxvcmlnaW4sZGVzdGluYXRpb24sdHJpcF9kYXRlLGZhcmUsdHJpcF9pZCxzdGF0dXMpIFZBTFVFUygkMSwkMiwkMywkNCwkNSwkNiwkNykgUkVUVVJOSU5HIConLFxuICAgIHZhbHVlczogW2RhdGEudXNlcl9pZCwgb3JpZ2luLCBkZXN0aW5hdGlvbiwgdHJpcF9kYXRlLCBmYXJlLCB1bmlxdWksICdBY3RpdmUnXSxcbiAgfTtcblxuICBkYi5xdWVyeShxdWVyeSkudGhlbigocmVzcCkgPT4ge1xuICAgIGxldCB0cmlwX2RhdGEgPSBudWxsO1xuICAgIHRyaXBfZGF0YSA9IHsgLi4ucmVzcC5yb3dzWzBdLCBpZDogcmVzcC5yb3dzWzBdLnRyaXBfaWQgfTtcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbihyZXNwb25zZS5zdWNjZXNzKHRyaXBfZGF0YSkpO1xuICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgY29uc29sZS5sb2coZXJyKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbihyZXNwb25zZS5lcnJvcignU29tZXRoaW5nIHdlbnQgd3JvbmcnKSk7XG4gIH0pO1xufSkuZ2V0KCcvJywgKHJlcSwgcmVzKSA9PiB7XG4gIC8vIGdldCBhbGwgdHJpcHMgYXZhaWxhYmxlXG4gIGRiLnF1ZXJ5KFwiU0VMRUNUICogRlJPTSB0cmlwcyBXSEVSRSBzdGF0dXMgPSAnQWN0aXZlJyBcIikudGhlbigocmVzcCkgPT4ge1xuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHJlc3BvbnNlLnN1Y2Nlc3MocmVzcC5yb3dzKSk7XG4gIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICBsb2dnZXIuZXJyb3IoZXJyKTtcbiAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShlcnIpKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbihyZXNwb25zZS5lcnJvcignRmFpbGVkIHRvIGZldGNoIHRyaXBzJykpO1xuICB9KTtcbn0pLnBhdGNoKCcvOnRyaXBJZCcsIGF1dGhDaGVjaywgKHJlcSwgcmVzKSA9PiB7XG4gIC8vIGNhbmNlbCBhIHRyaXBcbiAgY29uc3QgdHJpcElkID0gcmVxLnBhcmFtcy50cmlwSWQ7XG4gIGNvbnN0IHsgZGF0YSB9ID0gcmVxLmRlY29kZWQ7XG4gIGlmICghZGF0YS5pc19hZG1pbikge1xuICAgIHJlcy5zdGF0dXMoNDAxKS5qc29uKHJlc3BvbnNlLmVycm9yKCdBY2Nlc3MgRGVuaWVkJykpO1xuICB9XG5cbiAgZGIucXVlcnkoYFNFTEVDVCAqIEZST00gdHJpcHMgV0hFUkUgc3RhdHVzID0gJ0FjdGl2ZScgQU5EIHRyaXBfaWQgPSAnJHt0cmlwSWR9JyBgKS50aGVuKChyZXNwKSA9PiB7XG4gICAgaWYgKHJlc3Aucm93Q291bnQgPD0gMCkge1xuICAgICAgcmVzLnN0YXR1cyg0MDQpLmpzb24ocmVzcG9uc2UuZXJyb3IoJ1RyaXAgTm90IGZvdW5kJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkYi5xdWVyeShgVVBEQVRFIHRyaXBzIFNFVCBzdGF0dXMgPSAnY2FuY2VsbGVkJyBXSEVSRSB0cmlwX2lkID0gJyR7dHJpcElkfScgQU5EIHN0YXR1cyA9ICdBY3RpdmUnYCkudGhlbigoYnVzRGF0YSkgPT4ge1xuICAgICAgICByZXMuc3RhdHVzKDIwMCkuanNvbihyZXNwb25zZS5zdWNjZXNzKHsgbWVzc2FnZTogJ1RyaXAgY2FuY2VsbGVkIHN1Y2Nlc3NmdWxseScsIGJ1c0RhdGEgfSkpO1xuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICByZXMuc3RhdHVzKDUwMCkuanNvbihyZXNwb25zZS5lcnJvcih7IG1lc3NhZ2U6ICdUcmlwIGZhaWxlZCB0byBjYW5jZWwnIH0pKTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKHsgZXJyLCBtZXNzYWdlOiAnd2hpbGUgY2FuY2VsaW5nIHRyaXAnIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgbG9nZ2VyLmVycm9yKGVycik7XG5cbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbihyZXNwb25zZS5lcnJvcignRmFpbGVkIHRvIGZldGNoIHRyaXBzJykpO1xuICB9KTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjtcbiJdfQ==