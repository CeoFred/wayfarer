const express = require('express');
const logger = require('logger').createLogger('./app/development.log');

const router = express.Router();
const response = require('../helpers/response');
const db = require('../config/db');
const Utils = require('../helpers/utils');

const authCheck = require('../middlewares/auth_check');

// Book a seat on a trip
router.post('/', authCheck, (req, res) => {
  const tripId = req.body.trip_id;
  const { data } = req.decoded;
  const user = data.userId;

  const busIsFilled = (bus, booked) => {
    let state = null;
    return db.query(`SELECT capacity from bus WHERE bus_id ='${bus}'`).then((busData) => {
      const busExists = busData.rowCount > 0;
      if (busExists) {
        const capacity = busData.rows[0].capacity;
        if (Number(booked) > Number(capacity)) {
          state = true;
        } else {
          state = false;
        }
      } else {
        state = false;
      }
      return state;
    }).catch((err) => {
      state = false;
      logger.error(err);
    });
  };

  const incrementNumberBooked = (tripid) => {
    db.query(`UPDATE trips SET bookings = bookings + 1 WHERE trip_id = '${tripid}'`).then(() => {
    }).catch((err) => {
      logger.error(err);
    });
  };

  const userHasPreviousBooking = (trip) => {
    return db.query(`SELECT * FROM bookings WHERE user_id = '${user}' AND status = 'Active' AND trip_id = '${trip}'`).then((userBooking) => {
      if (userBooking.rowCount > 0) {
        return true;
      }
      return false;
    }).catch((err) => {
      logger.error(err);
      return false;
    });
  };
  db.query(`SELECT * FROM trips WHERE trip_id = '${tripId}' AND status = 'Active'`)
    .then((resp) => {
      if (resp.rowCount <= 0) {
        res.status(404).json(response.error('Trip not found'));
      }
      const busId = resp.rows[0].bus_id;
      const bookings = resp.rows[0].bookings;
      const booking = Number(bookings) + 1;
      console.log(booking);
      const isFilled = busIsFilled(busId, bookings);
      isFilled.then((filledRes) => {
        if (filledRes) {
          res.status(200).json(response.error('Bus is full'));
        } else {
          // check if user has booked before and return bookin details
          const isBooked = userHasPreviousBooking(tripId);
          isBooked.then((bookedRes) => {
            if (bookedRes) {
              res.status(403).json(response.error('Already booked by user'));
            }
          });

          db.query('INSERT INTO bookings(booking_id,trip_id,user_id,created_on,status,seat_number) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
            [Utils.randomString(200), resp.rows[0].trip_id, user, new Date(), 'Active', booking]).then((respo) => {
            incrementNumberBooked(tripId);
            res.status(201).json(response.success(respo.rows[0]));
          }).catch((err) => {
            return err;
          }).catch((err) => {
            logger.error(err);
            res.status(401).json(response.error('Failed to book trip'));
          });
        }
      }).catch((err) => {
        logger.error(err);
        res.status(401).json(response.error('Whoops! Something went wrong while checing bus capacity'));
      });
    }).catch((err) => {
      return err;
    }).catch((err) => {
      logger.error(err);
      res.status(401).json(response.error('Whoops! Something went wrong'));
    });
});

router.delete('/:bookingId', authCheck, (req, res) => {
// cancel bookking
  const { data } = req.decoded;

  const admin = data.is_admin;
  const user = data.userId;

  const bookingId = req.params.bookingId;

  db.query(`SELECT * FROM bookings WHERE booking_id = '${bookingId}' AND status =  'Active' `)
    .then((resp) => {
      if (resp.rowCount < 0) {
        logger.info('Booking Id Notfound');
        res.status(404).json(response.error('Booking ID not found'));
      }
      if (admin) {
        db.query(`UPDATE bookings SET status = 'deleted' WHERE booking_id = '${bookingId}' RETURNING *`)
          .then((deletedRow) => {
            res.status(200).json(response.success({ message: 'booking was deleted successfully', data: deletedRow }));
          }).catch((err) => {
            logger.error(err);


            res.status(500).json(response.error('Failed to cancle booking,check server logs'));
          });
      } else {
        db.query(`UPDATE bookings SET status = 'deleted' WHERE booking_id = '${bookingId}' AND user_id = '${user}' RETURNING *`)
          .then((deletedRow) => {
            res.status(200).json(response.success({ message: 'booking was deleted successfully', data: deletedRow }));
          }).catch((err) => {
            logger.error(err);
            res.status(500).json(response.error('Failed to cancle booking,check server logs'));
          });
      }
    }).catch((err) => {
      res.status(500).json(response.error('Whoops! Something went wrong'));
      logger.error(err);
    });
});

router.get('/', authCheck, (req, res) => {
// get all bookings
  const { data } = req.decoded;
  const user = data.userId;
  const admin = data.is_admin;
  db.query('SELECT bookings.user_id,users.email,users.first_name,users.last_name,bookings.booking_id FROM bookings INNER JOIN users USING (user_id)')
    .then((resp) => {
      if (admin) {
        res.status(200).json(response.success(resp.rows));
      } else {
        const userBooking = resp.rows.filter((bookings) => {
          return bookings.user_id === user;
        });
        res.status(200).json(response.success({ userBooking, for: 'user' }));
      }
    }).catch((err) => {
      logger.error(err);
      res.status(500).json(response.error('Whoops! Failed to fetch booking'));
    });
});

module.exports = router;
