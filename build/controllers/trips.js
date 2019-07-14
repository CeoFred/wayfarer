"use strict";

var express = require('express');

var logger = require('logger').createLogger('./development.log');

var router = express.Router();

var response = require('../helpers/response');

var db = require('../config/db');

var Utils = require('../helpers/utils');

var authCheck = require('../middlewares/auth_check');

router.post('/', authCheck, function (req, res) {
  // new trip
  var _req$body = req.body,
      busId = _req$body.busId,
      origin = _req$body.origin,
      destination = _req$body.destination,
      fare = _req$body.fare,
      tripDate = _req$body.tripDate,
      departureTime = _req$body.departureTime;
  var data = req.decoded.data;
  console.log(data);

  if (!data.is_admin) {
    res.status(401).json(response.error('Access Denied'));
  }

  var uniqui = Utils.randomString(200);
  db.query("SELECT * FROM bus WHERE bus_id = '".concat(busId, "'")).then(function (busData) {
    if (busData.rowCount <= 0) {
      res.status(404).json(response.error('Bus not found'));
    } else if (Boolean(busData.rows[0].trip_status) === true) {
      res.status(403).json(response.error('Bus has a trip that is active'));
    } else {
      var query = {
        text: 'INSERT INTO trips(user_id,bus_id,origin,destination,trip_date,fare,departure_time,trip_id,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
        values: [data.userId, busId, origin, destination, tripDate, fare, departureTime, uniqui.trimRight(), 'Active']
      };
      db.query(query).then(function (resp) {
        db.query("UPDATE bus SET trip_status = '".concat(true, "' WHERE bus_id = '", busId, "' RETURNING *")).then(function () {
          var trip_data = resp.rows[0];
          trip_data.id = resp.rows[0].booking_id;
          res.status(201).json(response.success(trip_data));
        })["catch"](function (err) {
          logger.error(err);
          res.status(500).json(response.error('Something went wrong'));
        });
      })["catch"](function (err) {
        logger.error(err);
        res.status(500).json(response.error('Something went wrong'));
      });
    }
  })["catch"](function (err) {
    logger.error(err);
    res.status(500).json(response.error('Whoops! Something went wrong'));
  });
}).get('/', function (req, res) {
  // get all trips available
  db.query("SELECT * FROM trips WHERE status = 'Active' ").then(function (resp) {
    res.status(200).json(response.success(resp.rows));
  })["catch"](function (err) {
    logger.error(err);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9jb250cm9sbGVycy90cmlwcy5qcyJdLCJuYW1lcyI6WyJleHByZXNzIiwicmVxdWlyZSIsImxvZ2dlciIsImNyZWF0ZUxvZ2dlciIsInJvdXRlciIsIlJvdXRlciIsInJlc3BvbnNlIiwiZGIiLCJVdGlscyIsImF1dGhDaGVjayIsInBvc3QiLCJyZXEiLCJyZXMiLCJib2R5IiwiYnVzSWQiLCJvcmlnaW4iLCJkZXN0aW5hdGlvbiIsImZhcmUiLCJ0cmlwRGF0ZSIsImRlcGFydHVyZVRpbWUiLCJkYXRhIiwiZGVjb2RlZCIsImNvbnNvbGUiLCJsb2ciLCJpc19hZG1pbiIsInN0YXR1cyIsImpzb24iLCJlcnJvciIsInVuaXF1aSIsInJhbmRvbVN0cmluZyIsInF1ZXJ5IiwidGhlbiIsImJ1c0RhdGEiLCJyb3dDb3VudCIsIkJvb2xlYW4iLCJyb3dzIiwidHJpcF9zdGF0dXMiLCJ0ZXh0IiwidmFsdWVzIiwidXNlcklkIiwidHJpbVJpZ2h0IiwicmVzcCIsInRyaXBfZGF0YSIsImlkIiwiYm9va2luZ19pZCIsInN1Y2Nlc3MiLCJlcnIiLCJnZXQiLCJwYXRjaCIsInRyaXBJZCIsInBhcmFtcyIsIm1lc3NhZ2UiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOztBQUFBLElBQU1BLE9BQU8sR0FBR0MsT0FBTyxDQUFDLFNBQUQsQ0FBdkI7O0FBQ0EsSUFBTUMsTUFBTSxHQUFHRCxPQUFPLENBQUMsUUFBRCxDQUFQLENBQWtCRSxZQUFsQixDQUErQixtQkFBL0IsQ0FBZjs7QUFFQSxJQUFNQyxNQUFNLEdBQUdKLE9BQU8sQ0FBQ0ssTUFBUixFQUFmOztBQUNBLElBQU1DLFFBQVEsR0FBR0wsT0FBTyxDQUFDLHFCQUFELENBQXhCOztBQUNBLElBQU1NLEVBQUUsR0FBR04sT0FBTyxDQUFDLGNBQUQsQ0FBbEI7O0FBQ0EsSUFBTU8sS0FBSyxHQUFHUCxPQUFPLENBQUMsa0JBQUQsQ0FBckI7O0FBRUEsSUFBTVEsU0FBUyxHQUFHUixP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QWpELFFBQUFBLE1BQU0sQ0FBQ3lCLEtBQVAsQ0FBYTtBQUFFbUIsVUFBQUEsR0FBRyxFQUFIQSxHQUFGO0FBQU9LLFVBQUFBLE9BQU8sRUFBRTtBQUFoQixTQUFiO0FBQ0QsT0FMRDtBQU1EO0FBQ0YsR0FYRCxXQVdTLFVBQUNMLEdBQUQsRUFBUztBQUNoQjVDLElBQUFBLE1BQU0sQ0FBQ3lCLEtBQVAsQ0FBYW1CLEdBQWI7QUFFQWxDLElBQUFBLEdBQUcsQ0FBQ2EsTUFBSixDQUFXLEdBQVgsRUFBZ0JDLElBQWhCLENBQXFCcEIsUUFBUSxDQUFDcUIsS0FBVCxDQUFlLHVCQUFmLENBQXJCO0FBQ0QsR0FmRDtBQWdCRCxDQXJGRDtBQXVGQXlCLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQmpELE1BQWpCIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJ2xvZ2dlcicpLmNyZWF0ZUxvZ2dlcignLi9kZXZlbG9wbWVudC5sb2cnKTtcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcbmNvbnN0IHJlc3BvbnNlID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZXNwb25zZScpO1xuY29uc3QgZGIgPSByZXF1aXJlKCcuLi9jb25maWcvZGInKTtcbmNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi4vaGVscGVycy91dGlscycpO1xuXG5jb25zdCBhdXRoQ2hlY2sgPSByZXF1aXJlKCcuLi9taWRkbGV3YXJlcy9hdXRoX2NoZWNrJyk7XG5cbnJvdXRlci5wb3N0KCcvJywgYXV0aENoZWNrLCAocmVxLCByZXMpID0+IHtcbiAgLy8gbmV3IHRyaXBcbiAgY29uc3Qge1xuICAgIGJ1c0lkLFxuICAgIG9yaWdpbixcbiAgICBkZXN0aW5hdGlvbixcbiAgICBmYXJlLFxuICAgIHRyaXBEYXRlLFxuICAgIGRlcGFydHVyZVRpbWUsXG5cbiAgfSA9IHJlcS5ib2R5O1xuICBjb25zdCB7IGRhdGEgfSA9IHJlcS5kZWNvZGVkO1xuICBjb25zb2xlLmxvZyhkYXRhKTtcblxuICBpZiAoIWRhdGEuaXNfYWRtaW4pIHtcbiAgICByZXMuc3RhdHVzKDQwMSkuanNvbihyZXNwb25zZS5lcnJvcignQWNjZXNzIERlbmllZCcpKTtcbiAgfVxuXG4gIGNvbnN0IHVuaXF1aSA9IFV0aWxzLnJhbmRvbVN0cmluZygyMDApO1xuXG4gIGRiLnF1ZXJ5KGBTRUxFQ1QgKiBGUk9NIGJ1cyBXSEVSRSBidXNfaWQgPSAnJHtidXNJZH0nYCkudGhlbigoYnVzRGF0YSkgPT4ge1xuICAgIGlmIChidXNEYXRhLnJvd0NvdW50IDw9IDApIHtcbiAgICAgIHJlcy5zdGF0dXMoNDA0KS5qc29uKHJlc3BvbnNlLmVycm9yKCdCdXMgbm90IGZvdW5kJykpO1xuICAgIH0gZWxzZSBpZiAoQm9vbGVhbihidXNEYXRhLnJvd3NbMF0udHJpcF9zdGF0dXMpID09PSB0cnVlKSB7XG4gICAgICByZXMuc3RhdHVzKDQwMykuanNvbihyZXNwb25zZS5lcnJvcignQnVzIGhhcyBhIHRyaXAgdGhhdCBpcyBhY3RpdmUnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0ge1xuICAgICAgICB0ZXh0OiAnSU5TRVJUIElOVE8gdHJpcHModXNlcl9pZCxidXNfaWQsb3JpZ2luLGRlc3RpbmF0aW9uLHRyaXBfZGF0ZSxmYXJlLGRlcGFydHVyZV90aW1lLHRyaXBfaWQsc3RhdHVzKSBWQUxVRVMoJDEsJDIsJDMsJDQsJDUsJDYsJDcsJDgsJDkpIFJFVFVSTklORyAqJyxcbiAgICAgICAgdmFsdWVzOiBbZGF0YS51c2VySWQsIGJ1c0lkLCBvcmlnaW4sIGRlc3RpbmF0aW9uLCB0cmlwRGF0ZSwgZmFyZSwgZGVwYXJ0dXJlVGltZSwgdW5pcXVpLnRyaW1SaWdodCgpLCAnQWN0aXZlJ10sXG4gICAgICB9O1xuXG4gICAgICBkYi5xdWVyeShxdWVyeSkudGhlbigocmVzcCkgPT4ge1xuICAgICAgICBkYi5xdWVyeShgVVBEQVRFIGJ1cyBTRVQgdHJpcF9zdGF0dXMgPSAnJHt0cnVlfScgV0hFUkUgYnVzX2lkID0gJyR7YnVzSWR9JyBSRVRVUk5JTkcgKmApLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRyaXBfZGF0YSA9IHJlc3Aucm93c1swXTtcbiAgICAgICAgICB0cmlwX2RhdGEuaWQgPSByZXNwLnJvd3NbMF0uYm9va2luZ19pZDtcbiAgICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihyZXNwb25zZS5zdWNjZXNzKHRyaXBfZGF0YSkpO1xuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG5cbiAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuanNvbihyZXNwb25zZS5lcnJvcignU29tZXRoaW5nIHdlbnQgd3JvbmcnKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcblxuICAgICAgICByZXMuc3RhdHVzKDUwMCkuanNvbihyZXNwb25zZS5lcnJvcignU29tZXRoaW5nIHdlbnQgd3JvbmcnKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICBsb2dnZXIuZXJyb3IoZXJyKTtcblxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHJlc3BvbnNlLmVycm9yKCdXaG9vcHMhIFNvbWV0aGluZyB3ZW50IHdyb25nJykpO1xuICB9KTtcbn0pLmdldCgnLycsIChyZXEsIHJlcykgPT4ge1xuICAvLyBnZXQgYWxsIHRyaXBzIGF2YWlsYWJsZVxuICBkYi5xdWVyeShcIlNFTEVDVCAqIEZST00gdHJpcHMgV0hFUkUgc3RhdHVzID0gJ0FjdGl2ZScgXCIpLnRoZW4oKHJlc3ApID0+IHtcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbihyZXNwb25zZS5zdWNjZXNzKHJlc3Aucm93cykpO1xuICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgbG9nZ2VyLmVycm9yKGVycik7XG5cbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbihyZXNwb25zZS5lcnJvcignRmFpbGVkIHRvIGZldGNoIHRyaXBzJykpO1xuICB9KTtcbn0pLnBhdGNoKCcvOnRyaXBJZCcsIGF1dGhDaGVjaywgKHJlcSwgcmVzKSA9PiB7XG4gIC8vIGNhbmNlbCBhIHRyaXBcbiAgY29uc3QgdHJpcElkID0gcmVxLnBhcmFtcy50cmlwSWQ7XG4gIGNvbnN0IHsgZGF0YSB9ID0gcmVxLmRlY29kZWQ7XG4gIGlmICghZGF0YS5pc19hZG1pbikge1xuICAgIHJlcy5zdGF0dXMoNDAxKS5qc29uKHJlc3BvbnNlLmVycm9yKCdBY2Nlc3MgRGVuaWVkJykpO1xuICB9XG5cbiAgZGIucXVlcnkoYFNFTEVDVCAqIEZST00gdHJpcHMgV0hFUkUgc3RhdHVzID0gJ0FjdGl2ZScgQU5EIHRyaXBfaWQgPSAnJHt0cmlwSWR9JyBgKS50aGVuKChyZXNwKSA9PiB7XG4gICAgaWYgKHJlc3Aucm93Q291bnQgPD0gMCkge1xuICAgICAgcmVzLnN0YXR1cyg0MDQpLmpzb24ocmVzcG9uc2UuZXJyb3IoJ1RyaXAgTm90IGZvdW5kJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkYi5xdWVyeShgVVBEQVRFIHRyaXBzIFNFVCBzdGF0dXMgPSAnY2FuY2VsbGVkJyBXSEVSRSB0cmlwX2lkID0gJyR7dHJpcElkfScgQU5EIHN0YXR1cyA9ICdBY3RpdmUnYCkudGhlbigoYnVzRGF0YSkgPT4ge1xuICAgICAgICByZXMuc3RhdHVzKDIwMCkuanNvbihyZXNwb25zZS5zdWNjZXNzKHsgbWVzc2FnZTogJ1RyaXAgY2FuY2VsbGVkIHN1Y2Nlc3NmdWxseScsIGJ1c0RhdGEgfSkpO1xuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICByZXMuc3RhdHVzKDUwMCkuanNvbihyZXNwb25zZS5lcnJvcih7IG1lc3NhZ2U6ICdUcmlwIGZhaWxlZCB0byBjYW5jZWwnIH0pKTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKHsgZXJyLCBtZXNzYWdlOiAnd2hpbGUgY2FuY2VsaW5nIHRyaXAnIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgbG9nZ2VyLmVycm9yKGVycik7XG5cbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbihyZXNwb25zZS5lcnJvcignRmFpbGVkIHRvIGZldGNoIHRyaXBzJykpO1xuICB9KTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjtcbiJdfQ==