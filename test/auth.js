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
const lastName = 'Lastname';
const firstName = 'Firstname';
const email = 'testmail@mailserver.com';
let user = null;
let token = null;
let bus = null;
describe('Server', () => {
  it('tests that server is running current port', async () => {
    await chai.expect(server.port).to.equal(config.server.port);
  });
});


describe('User Authentication', () => {
  describe('/POST User Signup', () => {
    before((done) => {
      db.query('DELETE FROM users').then(() => {
        done();
      }).catch((err) => {
        throw err;
      });
    });
    it('it should Register a new user', (done) => {
      chai.request(server.server)
        .post('/api/v1/user/signup')
        .set('Content-Type', 'Application/json')
        .send({
          password, lastName, firstName, email,
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          user = res.body.data.user_id;
          done();
        });
    });
  });

  describe('/POST Admin Assign Role', () => {
    it('it should make a random user an admin', (done) => {
      chai.request(server.server)
        .post(`/api/v1/user/admin/${user}`)
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJJZCI6ImFlOHdZVmZPV3kwT1lOZ094TFJabllFNFhoaXVTRzlRZWl6b3FkMFF0dzBZOU1CWWFtajZ2bjh1YTV6SDg5NUhwNmpMUGVpTm5IWVpIOVJiMDhVTFVyWFFUaGJNTGdkT1lOVDAwVWU4VERSZzZFZjRnOFVKWThxY1BQU05kenpFMm1Vdnh4aUthZzNhTDJaamRkQlk5clB5d3Z2QTlTZGtka2FaTHZoendTNEd0S3ZOdXVnclAxVTQyN0FHRHM5RDhiRHFPWW5VIiwiaXNfYWRtaW4iOnRydWV9LCJpYXQiOjE1NjI2NTkzNzEsImV4cCI6MTU2MzI2NDE3MX0.E-nTh9Nxi0SEBbsoR_6OmNWoW7KkEoHHdyaH5no6Ve0')
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
        .post('/api/v1/user/login')
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
  });

  describe('/POST Bus Test', () => {
    before((done) => {
      db.query('DELETE FROM bus').then(() => {
        done();
      }).catch((err) => {
        throw err;
      });
    });
    it('it should create a new bus', (done) => {
      logger.info(`token is legit ${token}`);
      chai.request(server.server)
        .post('/api/v1/bus/')
        .set('Content-Type', 'Application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({
          model: 'DMEDDEFRVT',
          numberPlate: 'SDRTEER',
          year: 2019,
          manufacturer: 'INNOSON',
          capacity: 150,
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          bus = res.body.data.bus_id;
          logger.info(`bus response is ${res}`);
          logger.info(`bus error is ${err}`);
          if (err) {
            throw err;
          }
          done();
        });
    });
  });
  describe('/POST Trip', () => {
    it('should create a new trip', (done) => {
      logger.info(`bus id is ${bus}`);
      chai.request(server.server)
        .post('/api/v1/trips/')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({
          busId: bus,
          origin: 'lagos',
          destination: 'owerri',
          fare: 50000.00,
          tripDate: 'July 4,2019',
          departureTime: '12:00 PM',
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
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
}).timeout('10s');
