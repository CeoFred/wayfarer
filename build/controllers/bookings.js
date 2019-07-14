"use strict";

var express = require('express');

var logger = require('logger').createLogger('./development.log');

var router = express.Router();

var response = require('../helpers/response');

var db = require('../config/db');

var Utils = require('../helpers/utils');

var authCheck = require('../middlewares/auth_check'); // Book a seat on a trip


router.post('/', authCheck, function (req, res) {
  var tripId = req.body.trip_id;
  var data = req.decoded.data;
  var user = data.userId;

  var busIsFilled = function busIsFilled(bus, booked) {
    var state = null;
    return db.query("SELECT capacity from bus WHERE bus_id ='".concat(bus, "'")).then(function (busData) {
      var busExists = busData.rowCount > 0;

      if (busExists) {
        var capacity = busData.rows[0].capacity;

        if (Number(booked) > Number(capacity)) {
          state = true;
        } else {
          state = false;
        }
      } else {
        state = false;
      }

      return state;
    })["catch"](function (err) {
      state = false;
      logger.error(err);
    });
  };

  var incrementNumberBooked = function incrementNumberBooked(tripid) {
    db.query("UPDATE trips SET bookings = bookings + 1 WHERE trip_id = '".concat(tripid, "'")).then(function () {})["catch"](function (err) {
      logger.error(err);
    });
  };

  var userHasPreviousBooking = function userHasPreviousBooking(trip) {
    return db.query("SELECT * FROM bookings WHERE user_id = '".concat(user, "' AND status = 'Active' AND trip_id = '").concat(trip, "'")).then(function (userBooking) {
      if (userBooking.rowCount > 0) {
        return true;
      }

      return false;
    })["catch"](function (err) {
      logger.error(err);
      return false;
    });
  };

  db.query("SELECT * FROM trips WHERE trip_id = '".concat(tripId, "' AND status = 'Active'")).then(function (resp) {
    if (resp.rowCount <= 0) {
      res.status(404).json(response.error('Trip not found'));
    }

    var busId = resp.rows[0].bus_id;
    var bookings = resp.rows[0].bookings;
    var booking = Number(bookings) + 1;
    console.log(booking);
    var isFilled = busIsFilled(busId, bookings);
    isFilled.then(function (filledRes) {
      if (filledRes) {
        res.status(200).json(response.error('Bus is full'));
      } else {
        // check if user has booked before and return bookin details
        var isBooked = userHasPreviousBooking(tripId);
        isBooked.then(function (bookedRes) {
          if (bookedRes) {
            res.status(403).json(response.error('Already booked by user'));
          }
        });
        db.query('INSERT INTO bookings(booking_id,trip_id,user_id,created_on,status,seat_number) VALUES($1,$2,$3,$4,$5,$6) RETURNING *', [Utils.randomString(200), resp.rows[0].trip_id, user, new Date(), 'Active', booking]).then(function (respo) {
          incrementNumberBooked(tripId);
          var book_ing = respo.rows[0];
          book_ing.id = respo.rows[0].booking_id;
          res.status(201).json(response.success(book_ing));
        })["catch"](function (err) {
          return err;
        })["catch"](function (err) {
          logger.error(err);
          res.status(401).json(response.error('Failed to book trip'));
        });
      }
    })["catch"](function (err) {
      logger.error(err);
      res.status(401).json(response.error('Whoops! Something went wrong while checing bus capacity'));
    });
  })["catch"](function (err) {
    return err;
  })["catch"](function (err) {
    logger.error(err);
    res.status(401).json(response.error('Whoops! Something went wrong'));
  });
});
router["delete"]('/:bookingId', authCheck, function (req, res) {
  // cancel bookking
  var data = req.decoded.data;
  var admin = data.is_admin;
  var user = data.userId;
  var bookingId = req.params.bookingId;
  db.query("SELECT * FROM bookings WHERE booking_id = '".concat(bookingId, "' AND status =  'Active' ")).then(function (resp) {
    if (resp.rowCount < 0) {
      logger.info('Booking Id Notfound');
      res.status(404).json(response.error('Booking ID not found'));
    }

    if (admin) {
      db.query("UPDATE bookings SET status = 'deleted' WHERE booking_id = '".concat(bookingId, "' RETURNING *")).then(function (deletedRow) {
        res.status(200).json(response.success({
          message: 'booking was deleted successfully',
          data: deletedRow
        }));
      })["catch"](function (err) {
        logger.error(err);
        res.status(500).json(response.error('Failed to cancle booking,check server logs'));
      });
    } else {
      db.query("UPDATE bookings SET status = 'deleted' WHERE booking_id = '".concat(bookingId, "' AND user_id = '").concat(user, "' RETURNING *")).then(function (deletedRow) {
        res.status(200).json(response.success({
          message: 'booking was deleted successfully',
          data: deletedRow
        }));
      })["catch"](function (err) {
        logger.error(err);
        res.status(500).json(response.error('Failed to cancle booking,check server logs'));
      });
    }
  })["catch"](function (err) {
    res.status(500).json(response.error('Whoops! Something went wrong'));
    logger.error(err);
  });
});
router.get('/', authCheck, function (req, res) {
  // get all bookings
  var data = req.decoded.data;
  var user = data.userId;
  var admin = data.is_admin;
  db.query('SELECT bookings.user_id,users.email,users.first_name,users.last_name,bookings.booking_id FROM bookings INNER JOIN users USING (user_id)').then(function (resp) {
    if (admin) {
      res.status(200).json(response.success(resp.rows));
    } else {
      var userBooking = resp.rows.filter(function (bookings) {
        return bookings.user_id === user;
      });
      res.status(200).json(response.success({
        userBooking: userBooking,
        "for": 'user'
      }));
    }
  })["catch"](function (err) {
    logger.error(err);
    res.status(500).json(response.error('Whoops! Failed to fetch booking'));
  });
});
module.exports = router;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9jb250cm9sbGVycy9ib29raW5ncy5qcyJdLCJuYW1lcyI6WyJleHByZXNzIiwicmVxdWlyZSIsImxvZ2dlciIsImNyZWF0ZUxvZ2dlciIsInJvdXRlciIsIlJvdXRlciIsInJlc3BvbnNlIiwiZGIiLCJVdGlscyIsImF1dGhDaGVjayIsInBvc3QiLCJyZXEiLCJyZXMiLCJ0cmlwSWQiLCJib2R5IiwidHJpcF9pZCIsImRhdGEiLCJkZWNvZGVkIiwidXNlciIsInVzZXJJZCIsImJ1c0lzRmlsbGVkIiwiYnVzIiwiYm9va2VkIiwic3RhdGUiLCJxdWVyeSIsInRoZW4iLCJidXNEYXRhIiwiYnVzRXhpc3RzIiwicm93Q291bnQiLCJjYXBhY2l0eSIsInJvd3MiLCJOdW1iZXIiLCJlcnIiLCJlcnJvciIsImluY3JlbWVudE51bWJlckJvb2tlZCIsInRyaXBpZCIsInVzZXJIYXNQcmV2aW91c0Jvb2tpbmciLCJ0cmlwIiwidXNlckJvb2tpbmciLCJyZXNwIiwic3RhdHVzIiwianNvbiIsImJ1c0lkIiwiYnVzX2lkIiwiYm9va2luZ3MiLCJib29raW5nIiwiY29uc29sZSIsImxvZyIsImlzRmlsbGVkIiwiZmlsbGVkUmVzIiwiaXNCb29rZWQiLCJib29rZWRSZXMiLCJyYW5kb21TdHJpbmciLCJEYXRlIiwicmVzcG8iLCJib29rX2luZyIsImlkIiwiYm9va2luZ19pZCIsInN1Y2Nlc3MiLCJhZG1pbiIsImlzX2FkbWluIiwiYm9va2luZ0lkIiwicGFyYW1zIiwiaW5mbyIsImRlbGV0ZWRSb3ciLCJtZXNzYWdlIiwiZ2V0IiwiZmlsdGVyIiwidXNlcl9pZCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBTUEsT0FBTyxHQUFHQyxPQUFPLENBQUMsU0FBRCxDQUF2Qjs7QUFDQSxJQUFNQyxNQUFNLEdBQUdELE9BQU8sQ0FBQyxRQUFELENBQVAsQ0FBa0JFLFlBQWxCLENBQStCLG1CQUEvQixDQUFmOztBQUVBLElBQU1D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c0NvbnRlbnQiOlsiY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJ2xvZ2dlcicpLmNyZWF0ZUxvZ2dlcignLi9kZXZlbG9wbWVudC5sb2cnKTtcblxuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcbmNvbnN0IHJlc3BvbnNlID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZXNwb25zZScpO1xuY29uc3QgZGIgPSByZXF1aXJlKCcuLi9jb25maWcvZGInKTtcbmNvbnN0IFV0aWxzID0gcmVxdWlyZSgnLi4vaGVscGVycy91dGlscycpO1xuXG5jb25zdCBhdXRoQ2hlY2sgPSByZXF1aXJlKCcuLi9taWRkbGV3YXJlcy9hdXRoX2NoZWNrJyk7XG5cbi8vIEJvb2sgYSBzZWF0IG9uIGEgdHJpcFxucm91dGVyLnBvc3QoJy8nLCBhdXRoQ2hlY2ssIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB0cmlwSWQgPSByZXEuYm9keS50cmlwX2lkO1xuICBjb25zdCB7IGRhdGEgfSA9IHJlcS5kZWNvZGVkO1xuICBjb25zdCB1c2VyID0gZGF0YS51c2VySWQ7XG5cbiAgY29uc3QgYnVzSXNGaWxsZWQgPSAoYnVzLCBib29rZWQpID0+IHtcbiAgICBsZXQgc3RhdGUgPSBudWxsO1xuICAgIHJldHVybiBkYi5xdWVyeShgU0VMRUNUIGNhcGFjaXR5IGZyb20gYnVzIFdIRVJFIGJ1c19pZCA9JyR7YnVzfSdgKS50aGVuKChidXNEYXRhKSA9PiB7XG4gICAgICBjb25zdCBidXNFeGlzdHMgPSBidXNEYXRhLnJvd0NvdW50ID4gMDtcbiAgICAgIGlmIChidXNFeGlzdHMpIHtcbiAgICAgICAgY29uc3QgY2FwYWNpdHkgPSBidXNEYXRhLnJvd3NbMF0uY2FwYWNpdHk7XG4gICAgICAgIGlmIChOdW1iZXIoYm9va2VkKSA+IE51bWJlcihjYXBhY2l0eSkpIHtcbiAgICAgICAgICBzdGF0ZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RhdGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBzdGF0ZSA9IGZhbHNlO1xuICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgfSk7XG4gIH07XG5cbiAgY29uc3QgaW5jcmVtZW50TnVtYmVyQm9va2VkID0gKHRyaXBpZCkgPT4ge1xuICAgIGRiLnF1ZXJ5KGBVUERBVEUgdHJpcHMgU0VUIGJvb2tpbmdzID0gYm9va2luZ3MgKyAxIFdIRVJFIHRyaXBfaWQgPSAnJHt0cmlwaWR9J2ApLnRoZW4oKCkgPT4ge1xuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuICAgIH0pO1xuICB9O1xuXG4gIGNvbnN0IHVzZXJIYXNQcmV2aW91c0Jvb2tpbmcgPSAodHJpcCkgPT4ge1xuICAgIHJldHVybiBkYi5xdWVyeShgU0VMRUNUICogRlJPTSBib29raW5ncyBXSEVSRSB1c2VyX2lkID0gJyR7dXNlcn0nIEFORCBzdGF0dXMgPSAnQWN0aXZlJyBBTkQgdHJpcF9pZCA9ICcke3RyaXB9J2ApLnRoZW4oKHVzZXJCb29raW5nKSA9PiB7XG4gICAgICBpZiAodXNlckJvb2tpbmcucm93Q291bnQgPiAwKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICB9O1xuICBkYi5xdWVyeShgU0VMRUNUICogRlJPTSB0cmlwcyBXSEVSRSB0cmlwX2lkID0gJyR7dHJpcElkfScgQU5EIHN0YXR1cyA9ICdBY3RpdmUnYClcbiAgICAudGhlbigocmVzcCkgPT4ge1xuICAgICAgaWYgKHJlc3Aucm93Q291bnQgPD0gMCkge1xuICAgICAgICByZXMuc3RhdHVzKDQwNCkuanNvbihyZXNwb25zZS5lcnJvcignVHJpcCBub3QgZm91bmQnKSk7XG4gICAgICB9XG4gICAgICBjb25zdCBidXNJZCA9IHJlc3Aucm93c1swXS5idXNfaWQ7XG4gICAgICBjb25zdCBib29raW5ncyA9IHJlc3Aucm93c1swXS5ib29raW5ncztcbiAgICAgIGNvbnN0IGJvb2tpbmcgPSBOdW1iZXIoYm9va2luZ3MpICsgMTtcbiAgICAgIGNvbnNvbGUubG9nKGJvb2tpbmcpO1xuICAgICAgY29uc3QgaXNGaWxsZWQgPSBidXNJc0ZpbGxlZChidXNJZCwgYm9va2luZ3MpO1xuICAgICAgaXNGaWxsZWQudGhlbigoZmlsbGVkUmVzKSA9PiB7XG4gICAgICAgIGlmIChmaWxsZWRSZXMpIHtcbiAgICAgICAgICByZXMuc3RhdHVzKDIwMCkuanNvbihyZXNwb25zZS5lcnJvcignQnVzIGlzIGZ1bGwnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gY2hlY2sgaWYgdXNlciBoYXMgYm9va2VkIGJlZm9yZSBhbmQgcmV0dXJuIGJvb2tpbiBkZXRhaWxzXG4gICAgICAgICAgY29uc3QgaXNCb29rZWQgPSB1c2VySGFzUHJldmlvdXNCb29raW5nKHRyaXBJZCk7XG4gICAgICAgICAgaXNCb29rZWQudGhlbigoYm9va2VkUmVzKSA9PiB7XG4gICAgICAgICAgICBpZiAoYm9va2VkUmVzKSB7XG4gICAgICAgICAgICAgIHJlcy5zdGF0dXMoNDAzKS5qc29uKHJlc3BvbnNlLmVycm9yKCdBbHJlYWR5IGJvb2tlZCBieSB1c2VyJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgZGIucXVlcnkoJ0lOU0VSVCBJTlRPIGJvb2tpbmdzKGJvb2tpbmdfaWQsdHJpcF9pZCx1c2VyX2lkLGNyZWF0ZWRfb24sc3RhdHVzLHNlYXRfbnVtYmVyKSBWQUxVRVMoJDEsJDIsJDMsJDQsJDUsJDYpIFJFVFVSTklORyAqJyxcbiAgICAgICAgICAgIFtVdGlscy5yYW5kb21TdHJpbmcoMjAwKSwgcmVzcC5yb3dzWzBdLnRyaXBfaWQsIHVzZXIsIG5ldyBEYXRlKCksICdBY3RpdmUnLCBib29raW5nXSkudGhlbigocmVzcG8pID0+IHtcbiAgICAgICAgICAgIGluY3JlbWVudE51bWJlckJvb2tlZCh0cmlwSWQpO1xuICAgICAgICAgICAgY29uc3QgYm9va19pbmcgPSByZXNwby5yb3dzWzBdO1xuICAgICAgICAgICAgYm9va19pbmcuaWQgPSByZXNwby5yb3dzWzBdLmJvb2tpbmdfaWQ7XG4gICAgICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihyZXNwb25zZS5zdWNjZXNzKGJvb2tfaW5nKSk7XG4gICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGVycjtcbiAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoNDAxKS5qc29uKHJlc3BvbnNlLmVycm9yKCdGYWlsZWQgdG8gYm9vayB0cmlwJykpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgICByZXMuc3RhdHVzKDQwMSkuanNvbihyZXNwb25zZS5lcnJvcignV2hvb3BzISBTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSBjaGVjaW5nIGJ1cyBjYXBhY2l0eScpKTtcbiAgICAgIH0pO1xuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHJldHVybiBlcnI7XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgICByZXMuc3RhdHVzKDQwMSkuanNvbihyZXNwb25zZS5lcnJvcignV2hvb3BzISBTb21ldGhpbmcgd2VudCB3cm9uZycpKTtcbiAgICB9KTtcbn0pO1xuXG5yb3V0ZXIuZGVsZXRlKCcvOmJvb2tpbmdJZCcsIGF1dGhDaGVjaywgKHJlcSwgcmVzKSA9PiB7XG4vLyBjYW5jZWwgYm9va2tpbmdcbiAgY29uc3QgeyBkYXRhIH0gPSByZXEuZGVjb2RlZDtcblxuICBjb25zdCBhZG1pbiA9IGRhdGEuaXNfYWRtaW47XG4gIGNvbnN0IHVzZXIgPSBkYXRhLnVzZXJJZDtcblxuICBjb25zdCBib29raW5nSWQgPSByZXEucGFyYW1zLmJvb2tpbmdJZDtcblxuICBkYi5xdWVyeShgU0VMRUNUICogRlJPTSBib29raW5ncyBXSEVSRSBib29raW5nX2lkID0gJyR7Ym9va2luZ0lkfScgQU5EIHN0YXR1cyA9ICAnQWN0aXZlJyBgKVxuICAgIC50aGVuKChyZXNwKSA9PiB7XG4gICAgICBpZiAocmVzcC5yb3dDb3VudCA8IDApIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0Jvb2tpbmcgSWQgTm90Zm91bmQnKTtcbiAgICAgICAgcmVzLnN0YXR1cyg0MDQpLmpzb24ocmVzcG9uc2UuZXJyb3IoJ0Jvb2tpbmcgSUQgbm90IGZvdW5kJykpO1xuICAgICAgfVxuICAgICAgaWYgKGFkbWluKSB7XG4gICAgICAgIGRiLnF1ZXJ5KGBVUERBVEUgYm9va2luZ3MgU0VUIHN0YXR1cyA9ICdkZWxldGVkJyBXSEVSRSBib29raW5nX2lkID0gJyR7Ym9va2luZ0lkfScgUkVUVVJOSU5HICpgKVxuICAgICAgICAgIC50aGVuKChkZWxldGVkUm93KSA9PiB7XG4gICAgICAgICAgICByZXMuc3RhdHVzKDIwMCkuanNvbihyZXNwb25zZS5zdWNjZXNzKHsgbWVzc2FnZTogJ2Jvb2tpbmcgd2FzIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JywgZGF0YTogZGVsZXRlZFJvdyB9KSk7XG4gICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG5cblxuICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLmpzb24ocmVzcG9uc2UuZXJyb3IoJ0ZhaWxlZCB0byBjYW5jbGUgYm9va2luZyxjaGVjayBzZXJ2ZXIgbG9ncycpKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRiLnF1ZXJ5KGBVUERBVEUgYm9va2luZ3MgU0VUIHN0YXR1cyA9ICdkZWxldGVkJyBXSEVSRSBib29raW5nX2lkID0gJyR7Ym9va2luZ0lkfScgQU5EIHVzZXJfaWQgPSAnJHt1c2VyfScgUkVUVVJOSU5HICpgKVxuICAgICAgICAgIC50aGVuKChkZWxldGVkUm93KSA9PiB7XG4gICAgICAgICAgICByZXMuc3RhdHVzKDIwMCkuanNvbihyZXNwb25zZS5zdWNjZXNzKHsgbWVzc2FnZTogJ2Jvb2tpbmcgd2FzIGRlbGV0ZWQgc3VjY2Vzc2Z1bGx5JywgZGF0YTogZGVsZXRlZFJvdyB9KSk7XG4gICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuanNvbihyZXNwb25zZS5lcnJvcignRmFpbGVkIHRvIGNhbmNsZSBib29raW5nLGNoZWNrIHNlcnZlciBsb2dzJykpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHJlc3BvbnNlLmVycm9yKCdXaG9vcHMhIFNvbWV0aGluZyB3ZW50IHdyb25nJykpO1xuICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgfSk7XG59KTtcblxucm91dGVyLmdldCgnLycsIGF1dGhDaGVjaywgKHJlcSwgcmVzKSA9PiB7XG4vLyBnZXQgYWxsIGJvb2tpbmdzXG4gIGNvbnN0IHsgZGF0YSB9ID0gcmVxLmRlY29kZWQ7XG4gIGNvbnN0IHVzZXIgPSBkYXRhLnVzZXJJZDtcbiAgY29uc3QgYWRtaW4gPSBkYXRhLmlzX2FkbWluO1xuICBkYi5xdWVyeSgnU0VMRUNUIGJvb2tpbmdzLnVzZXJfaWQsdXNlcnMuZW1haWwsdXNlcnMuZmlyc3RfbmFtZSx1c2Vycy5sYXN0X25hbWUsYm9va2luZ3MuYm9va2luZ19pZCBGUk9NIGJvb2tpbmdzIElOTkVSIEpPSU4gdXNlcnMgVVNJTkcgKHVzZXJfaWQpJylcbiAgICAudGhlbigocmVzcCkgPT4ge1xuICAgICAgaWYgKGFkbWluKSB7XG4gICAgICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHJlc3BvbnNlLnN1Y2Nlc3MocmVzcC5yb3dzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB1c2VyQm9va2luZyA9IHJlc3Aucm93cy5maWx0ZXIoKGJvb2tpbmdzKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGJvb2tpbmdzLnVzZXJfaWQgPT09IHVzZXI7XG4gICAgICAgIH0pO1xuICAgICAgICByZXMuc3RhdHVzKDIwMCkuanNvbihyZXNwb25zZS5zdWNjZXNzKHsgdXNlckJvb2tpbmcsIGZvcjogJ3VzZXInIH0pKTtcbiAgICAgIH1cbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcbiAgICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHJlc3BvbnNlLmVycm9yKCdXaG9vcHMhIEZhaWxlZCB0byBmZXRjaCBib29raW5nJykpO1xuICAgIH0pO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm91dGVyO1xuIl19