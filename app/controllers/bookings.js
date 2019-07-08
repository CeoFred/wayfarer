const express = require('express');

const router = express.Router();
const {
  check,
  validationResult, body
} = require('express-validator');

const { sanitizeBody } = require('express-validator');
const response = require('../helpers/response');
const db = require('../config/db');
const Utils = require('../helpers/utils');

const authCheck = require('../middlewares/auth_check');

// Book a seat on a trip
router.post('/:tripId', authCheck, (req, res) => {
  const tripId = req.params.tripId;
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
        console.log(err);
      });
    
  };

  const incrementNumberBooked = (tripid) => {
    db.query(`UPDATE trips SET bookings = bookings + 1 WHERE trip_id = '${tripid}'`).then((res) => {
      console.log('Updated');
    }).catch((err) => {
      console.log(err);
    });
  };

  const userHasPreviousBooking = (trip) => {
  return  db.query(`SELECT * FROM bookings WHERE user_id = '${user}' AND status = 'Active' AND trip_id = '${trip}'`).then(userBooking => {
        console.log(userBooking)
        if(userBooking.rowCount > 0){
            return true;
          }else{
              return false;
          }
      }).catch(err => {
          console.log(err)
          return false;
      })
  }
  // check the bus capacity
  // check if bus is filled with respect to trip booking, add new column for this number_booked
  // for each new trip booking increment the number_booked
  db.query(`SELECT * FROM trips WHERE trip_id = '${tripId}' AND status = 'Active'`)
    .then((resp) => {
      if (resp.rowCount <= 0) {
        res.status(404).json(response.error('Trip not found'));
      }
      const busId = resp.rows[0].bus_id;
      const bookings = resp.rows[0].bookings;
      const isFilled = busIsFilled(busId, bookings);
      isFilled.then((filledRes) => {
        if (filledRes) {
          res.status(200).json(response.error('Bus is full'));
        } else {
            //check if user has booked before and return bookin details
        const isBooked =  userHasPreviousBooking(tripId);
        isBooked.then(bookedRes => {
            if(bookedRes){
               res.status(403).json(response.error('Already booked by user'))
            }
        })   

          db.query('INSERT INTO bookings(booking_id,trip_id,user_id,created_on,status) VALUES($1,$2,$3,$4,$5) RETURNING *',
            [Utils.randomString(200), resp.rows[0].trip_id, user, new Date(), 'Active']).then((respo) => {
            incrementNumberBooked(tripId);
            res.status(201).json(response.success(respo.rows[0]));
          }).catch((err) => {
            res.status(500).json(response.error('Failed to book trip'));
            console.log(err);
          });
        }
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      res.status(500).json(response.error('Whoops! Something went wrong'));
      console.log(err);
    });
});

router.patch('/:bookingId', authCheck, (req, res) => {
// delete bookking
  const { data } = req.decoded;

  const admin = data.is_admin;
  const user = data.userId;

  const bookingId = req.params.bookingId;

  db.query(`SELECT * FROM bookings WHERE bookingId = '${bookingId}' AND status =  'Active' `)
    .then((resp) => {
      if (resp.rowCount < 0) {
        res.status(404).json(response.error('Booking ID not found'));
      }
      if (admin) {
        db.query(`UPDATE bookings SET status = 'deleted' WHERE bookingId = '${bookingId}' RETURNING *`)
          .then((deletedRow) => {
            console.log(deletedRow);
            res.status(200).json(response.success(deletedRow.rows[0]));
          }).catch((err) => {
            console.log(err);

            res.status(500).json(response.error('Failed to cancle booking,check server logs'));
          });
      } else {
        db.query(`UPDATE bookings SET status = 'deleted' WHERE booking_id = '${bookingId}' AND user_id = '${user}' RETURNING *`)
          .then((deletedRow) => {
            console.log(deletedRow);
            res.status(200).json(response.success(deletedRow.rows[0]));
          }).catch((err) => {
            console.log(err);

            res.status(500).json(response.error('Failed to cancle booking,check server logs'));
          });
      }
    }).catch((err) => {
      res.status(500).json(response.error('Whoops! Something went wrong'));
      console.log(err);
    });
});

router.get('/', authCheck, (req, res) => {
// get al bookings
  const { data } = req.decoded;
  const user = data.userId;
  const admin = data.is_admin;
  console.log(user);

  db.query('SELECT bookings.user_id,trips.fare,trips.origin,trips.destination,trips.bus_id,bookings.booking_id FROM bookings INNER JOIN trips USING (trip_id)')
    .then((resp) => {
      if (admin) {
        res.status(200).json(response.success(resp.rows));
      } else {
        const userBooking = resp.rows.filter((bookings) => {
          console.log(bookings);
          return bookings.user_id === user;
        });
        console.log(userBooking);
        res.status(200).json(response.success({ userBooking, for: 'user' }));
      }
    }).catch((err) => {
      console.log(err);
      res.status(500).json(response.error('Whoops! Failed to fetch booking'));
    });
});

module.exports = router;
