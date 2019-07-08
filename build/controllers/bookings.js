"use strict";

var express = require('express');

var router = express.Router();

var _require = require('express-validator'),
    check = _require.check,
    validationResult = _require.validationResult,
    body = _require.body;

var _require2 = require('express-validator'),
    sanitizeBody = _require2.sanitizeBody;

var response = require('../helpers/response');

var db = require('../config/db');

var Utils = require('../helpers/utils');

var authCheck = require('../middlewares/auth_check'); // Book a seat on a trip


router.post('/:tripId', authCheck, function (req, res) {
  var tripId = req.params.tripId;
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
      console.log(err);
    });
  };

  var incrementNumberBooked = function incrementNumberBooked(tripid) {
    db.query("UPDATE trips SET bookings = bookings + 1 WHERE trip_id = '".concat(tripid, "'")).then(function (res) {
      console.log('Updated');
    })["catch"](function (err) {
      console.log(err);
    });
  };

  var userHasPreviousBooking = function userHasPreviousBooking(trip) {
    return db.query("SELECT * FROM bookings WHERE user_id = '".concat(user, "' AND status = 'Active' AND trip_id = '").concat(trip, "'")).then(function (userBooking) {
      console.log(userBooking);

      if (userBooking.rowCount > 0) {
        return true;
      } else {
        return false;
      }
    })["catch"](function (err) {
      console.log(err);
      return false;
    });
  }; // check the bus capacity
  // check if bus is filled with respect to trip booking, add new column for this number_booked
  // for each new trip booking increment the number_booked


  db.query("SELECT * FROM trips WHERE trip_id = '".concat(tripId, "' AND status = 'Active'")).then(function (resp) {
    if (resp.rowCount <= 0) {
      res.status(404).json(response.error('Trip not found'));
    }

    var busId = resp.rows[0].bus_id;
    var bookings = resp.rows[0].bookings;
    var isFilled = busIsFilled(busId, bookings);
    isFilled.then(function (filledRes) {
      if (filledRes) {
        res.status(200).json(response.error('Bus is full'));
      } else {
        //check if user has booked before and return bookin details
        var isBooked = userHasPreviousBooking(tripId);
        isBooked.then(function (bookedRes) {
          if (bookedRes) {
            res.status(403).json(response.error('Already booked by user'));
          }
        });
        db.query('INSERT INTO bookings(booking_id,trip_id,user_id,created_on,status) VALUES($1,$2,$3,$4,$5) RETURNING *', [Utils.randomString(200), resp.rows[0].trip_id, user, new Date(), 'Active']).then(function (respo) {
          incrementNumberBooked(tripId);
          res.status(201).json(response.success(respo.rows[0]));
        })["catch"](function (err) {
          res.status(500).json(response.error('Failed to book trip'));
          console.log(err);
        });
      }
    })["catch"](function (err) {
      console.log(err);
    });
  })["catch"](function (err) {
    res.status(500).json(response.error('Whoops! Something went wrong'));
    console.log(err);
  });
});
router.patch('/:bookingId', authCheck, function (req, res) {
  // delete bookking
  var data = req.decoded.data;
  var admin = data.is_admin;
  var user = data.userId;
  var bookingId = req.params.bookingId;
  db.query("SELECT * FROM bookings WHERE bookingId = '".concat(bookingId, "' AND status =  'Active' ")).then(function (resp) {
    if (resp.rowCount < 0) {
      res.status(404).json(response.error('Booking ID not found'));
    }

    if (admin) {
      db.query("UPDATE bookings SET status = 'deleted' WHERE bookingId = '".concat(bookingId, "' RETURNING *")).then(function (deletedRow) {
        console.log(deletedRow);
        res.status(200).json(response.success(deletedRow.rows[0]));
      })["catch"](function (err) {
        console.log(err);
        res.status(500).json(response.error('Failed to cancle booking,check server logs'));
      });
    } else {
      db.query("UPDATE bookings SET status = 'deleted' WHERE booking_id = '".concat(bookingId, "' AND user_id = '").concat(user, "' RETURNING *")).then(function (deletedRow) {
        console.log(deletedRow);
        res.status(200).json(response.success(deletedRow.rows[0]));
      })["catch"](function (err) {
        console.log(err);
        res.status(500).json(response.error('Failed to cancle booking,check server logs'));
      });
    }
  })["catch"](function (err) {
    res.status(500).json(response.error('Whoops! Something went wrong'));
    console.log(err);
  });
});
router.get('/', authCheck, function (req, res) {
  // get al bookings
  var data = req.decoded.data;
  var user = data.userId;
  var admin = data.is_admin;
  console.log(user);
  db.query('SELECT bookings.user_id,trips.fare,trips.origin,trips.destination,trips.bus_id,bookings.booking_id FROM bookings INNER JOIN trips USING (trip_id)').then(function (resp) {
    if (admin) {
      res.status(200).json(response.success(resp.rows));
    } else {
      var userBooking = resp.rows.filter(function (bookings) {
        console.log(bookings);
        return bookings.user_id === user;
      });
      console.log(userBooking);
      res.status(200).json(response.success({
        userBooking: userBooking,
        "for": 'user'
      }));
    }
  })["catch"](function (err) {
    console.log(err);
    res.status(500).json(response.error('Whoops! Failed to fetch booking'));
  });
});
module.exports = router;
//# sourceMappingURL=bookings.js.map