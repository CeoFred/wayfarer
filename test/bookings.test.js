const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../bin/www');

const { expect } = chai;
// const db = require('../app/config/db');

chai.use(chaiHttp);

// describe('Bookings', () => {
//   it('Should throw trip not found error', (done) => {
//     chai.request(server.server)
//     .post('/api/v1/bookings')
//     .set('Content-Type', 'application/json')
//     .set('Authorization', `Bearer ${token}`)
//     .send({trip_id:'3d2d2dq'})
//     .end((err, res) => {
//       expect(res).to.have.status(200);
//       done();
//     });
//   });
// });

describe('Bookings', () => {
  it('Should throw token authentication failed', (done) => {
    chai.request(server.server)
      .post('/api/v1/bookings')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer 2345333dc2cw3')
      .end((err, res) => {
        expect(res).to.have.status(401);
        const message = res.body.error;
        expect(message).to.equal('Token Authentication Failed');
        done();
      });
  });
});
