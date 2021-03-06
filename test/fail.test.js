const chai = require('chai');
const chaiHttp = require('chai-http');
// const logger = require('logger').createLogger('./app/development.log');

const server = require('../bin/www');

const { expect } = chai;
chai.use(chaiHttp);
const db = require('../app/config/db');

const password2 = 'password';
const lastName2 = 'Lastname';
const firstName2 = 'Firstname';
const email2 = 'secontest@mailserver.com';
const adminEmail = 'admin@mailserver.com';

let user2;
let token2;

describe('Fail test', () => {
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
        password: password2, last_name: lastName2, first_name: firstName2, email: adminEmail,
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        user2 = res.body.data.user_id;
        done();
      });
  });

  it('it should Register a user', (done) => {
    chai.request(server.server)
      .post('/api/v1/auth/signup')
      .set('Content-Type', 'Application/json')
      .send({
        password: password2, last_name: lastName2, first_name: firstName2, email: email2,
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        done();
      });
  });

  it('it should login a user', (done) => {
    chai.request(server.server)
      .post('/api/v1/auth/signin')
      .set('Content-Type', 'Application/json')
      .send({ password: password2, email: email2 })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.token, 'No token provided but why?').to.be.a('string');
        expect(res.body.data.user_id, 'User ID was not a string,why?').to.be.a('string');
        token2 = res.body.data.token;
        user2 = res.body.data.user_id;
        done();
      });
  });

  it('it should deny access to cancel trip', (done) => {
    chai.request(server.server)
      .patch('/api/v1/trips/234565432')
      .set('Content-Type', 'Application/json')
      .send({ password: password2, email: email2 })
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body.error).to.be.a('string');
        done();
      });
  });
  it('it should fail to assign role to user', (done) => {
    chai.request(server.server)
      .post(`/api/v1/auth/admin/${user2}`)
      .set('Content-Type', 'Application/json')
      .set('Authorization', `Bearer ${token2}`)
      .end((err, res) => {
        expect(res).to.have.status(505);
        expect(res.body.error).to.be.a('string');
        done();
      });
  });
}).timeout('10s');
