'use-strict';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../bin/www');

const { expect } = chai;
const db = require('../app/config/db');
const config = require('../app/config/config');

chai.use(chaiHttp);

describe('Server', () => {
  it('tests that server is running current port', async () => {
    await chai.expect(server.port).to.equal(config.server.port);
  });
});


describe('User Authentication', () => {
  describe('/POST User Signup', () => {
    before((done) => {
      db.query('DELETE FROM users').then((data) => {
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
          password: 'messilo18_', lastName: 'okb', firstName: 'kb', email: 'handy@gmail.com',
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          done();
        });
    });
  });


  describe('/POST User login', () => {
    it('it should login', (done) => {
      chai.request(server.server)
        .post('/api/v1/user/login')
        .set('Content-Type', 'Application/json')
        .send({ password: 'messilo18_', email: 'handy@gmail.com' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          // expect(res.data.token).not.to.be('null')
          expect(res.body.data.token, 'No token provided but why?').to.be.a('string');
          expect(res.body.data.user_id, 'User ID was not a string,why?').to.be.a('string');

          done();
        });
    });
  });
});
