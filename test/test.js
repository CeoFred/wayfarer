// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const logger = require('logger').createLogger('./app/development.log');

const server = require('../bin/www');

const { expect } = chai;
const db = require('../app/config/db');
const config = require('../app/config/config');

chai.use(chaiHttp);
const password = 'password';
const last_name = 'Lastname';
const first_name = 'Firstname';
const email = 'testmail@mailserver.com';
const adminEmail = 'adminmail@mailserver.com';

let user;
let token;
let trip;
let booking;
let adminToken;

describe('Server', () => {
  it('tests that server is running current port', async () => {
    await chai.expect(server.port).to.equal(config.server.port);
  });
});


describe('Application', () => {
  describe('/POST User Signup', () => {
    before((done) => {
      db.query('DELETE FROM users').then(() => {
        db.query('DELETE FROM bookings').then(() => {
          db.query('DELETE FROM trips').then(() => {
            done();
          }).catch((err) => {
            throw err;
          });
        }).catch((err) => {
          throw err;
        });
      }).catch((err) => {
        throw err;
      });
    });
    it('it should Register an admin', (done) => {
      chai.request(server.server)
        .post('/api/v1/auth/signup')
        .set('Content-Type', 'Application/json')
        .send({
          password, last_name, first_name, email: adminEmail,
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          adminToken = res.body.data.token;
          done();
        });
    });
    it('it should Register a user', (done) => {
      chai.request(server.server)
        .post('/api/v1/auth/signup')
        .set('Content-Type', 'Application/json')
        .send({
          password, last_name, first_name, email,
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          user = res.body.data.user_id;
          token = res.body.data.token;
          done();
        });
    });


    it('should not register the user again', (done) => {
      chai.request(server.server)
        .post('/api/v1/auth/signup')
        .set('Content-Type', 'Application/json')
        .send({
          password, last_name, first_name, email,
        })
        .end((err, res) => {
          expect(res).to.have.status(403);
          const message = res.body.error;
          expect(message).to.equal('Email already exists');
          done();
        });
    });
    it('should fail when one parameter is missing', (done) => {
      chai.request(server.server)
        .post('/api/v1/auth/signup')
        .set('Content-Type', 'Application/json')
        .send({
          password, last_name, first_name,
        })
        .end((err, res) => {
          expect(res).to.have.status(404);
          const message = res.body.error;
          expect(message).to.be.an('object');
          done();
        });
    });
    it('should make password encryption to fail', (done) => {
      chai.request(server.server)
        .post('/api/v1/auth/signup')
        .set('Content-Type', 'Application/json')
        .send({
          password: null, last_name, first_name, email: 'new@gmail.com'
        })
        .end((err, res) => {
          expect(res).to.have.status(500);
          done();
        });
    });
    it('should fail due to wrong email format', (done) => {
      chai.request(server.server)
        .post('/api/v1/auth/signin')
        .set('Content-Type', 'Application/json')
        .send({
          password: null, email: 'new+@.com'
        })
        .end((err, res) => {
          expect(res).to.have.status(403);
          const message = res.body.error;
          expect(message).to.be.an('object');
          done();
        });
    });
    it('should fail due to wrong password', (done) => {
      chai.request(server.server)
        .post('/api/v1/auth/signin')
        .set('Content-Type', 'Application/json')
        .send({
          password: null, email
        })
        .end((err, res) => {
          expect(res).to.have.status(500);
          const message = res.body.error;
          expect(message).to.equal('Failed to compare passwords');
          done();
        });
    });
    it('should fail because email does not exist', (done) => {
      chai.request(server.server)
        .post('/api/v1/auth/signin')
        .set('Content-Type', 'Application/json')
        .send({
          password, email: 'doesnotexist@gmail.com'
        })
        .end((err, res) => {
          expect(res).to.have.status(402);
          const message = res.body.error;
          expect(message).to.equal('Email does not exist');
          done();
        });
    });
  });

  describe('/POST Admin Assign Role', () => {
    it('it should make a random user an admin', (done) => {
      chai.request(server.server)
        .post(`/api/v1/auth/admin/${user}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .end((adminErr, adminRes) => {
          expect(adminRes).to.have.status(200);
          expect(adminRes.body.data.is_admin, 'Admin rights not granted').to.be.a('boolean');
          expect(adminRes.body.status, 'Response was not a string,why?').to.be.a('string');
          done();
        });
    });
  });

  describe('/POST User login', () => {
    it('it should login', (done) => {
      chai.request(server.server)
        .post('/api/v1/auth/signin')
        .set('Content-Type', 'Application/json')
        .send({ password, email })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.token, 'No token provided but why?').to.be.a('string');
          expect(res.body.data.user_id, 'User ID was not a string,why?').to.be.a('string');
          token = res.body.data.token;
          done();
        });
    });

    it('should get bookings', (done) => {
      chai.request(server.server)
        .get('/api/v1/bookings')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });
  describe('/POST Trip', () => {
    it('should create a new trip', (done) => {
      chai.request(server.server)
        .post('/api/v1/trips/')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({
          origin: 'lagos',
          destination: 'owerri',
          fare: 50000.00,
          trip_date: 'July 4,2019',
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          trip = res.body.data.trip_id;
          logger.info(`Trip ID Is ${trip}`);
          done();
        });
    });
    it('should not find the trip', (done) => {
      chai.request(server.server)
        .patch('/api/v1/trips/3456')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          const message = res.body.error;
          expect(message).to.equal('Trip Not found');
          done();
        });
    });

    it('should create a booking', (done) => {
      chai.request(server.server)
        .post('/api/v1/bookings')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({ trip_id: trip })
        .end((err, res) => {
          expect(res).to.have.status(201);
          booking = res.body.data.booking_id;
          done();
        });
    });

    it('should throw user already booked', (done) => {
      chai.request(server.server)
        .post('/api/v1/bookings')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({ trip_id: trip })
        .end((err, res) => {
          expect(res).to.have.status(403);
          const message = res.body.error;
          expect(message).to.equal('Already booked by user');
          done();
        });
    });


    it('should cancel a booking', (done) => {
      chai.request(server.server)
        .delete(`/api/v1/bookings/${booking}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should return all booking', (done) => {
      chai.request(server.server)
        .get('/api/v1/bookings/')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should return trip not found', (done) => {
      chai.request(server.server)
        .post('/api/v1/bookings')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({ trip_id: 2323 })
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('should cancel a trip', (done) => {
      chai.request(server.server)
        .patch(`/api/v1/trips/${trip}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  describe('Trip', () => {
    it('should return all trips', (done) => {
      chai.request(server.server)
        .get('/api/v1/trips/')
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });
}).timeout('17s');
