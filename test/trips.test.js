const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../bin/www');

const { expect, request } = chai;

chai.use(chaiHttp);

describe('Trip', () => {
  it('should create a new trip', (done) => {
    request(server.server)
      .post('/api/v1/trips/')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJJZCI6InVmOFdTa0FSVVNqZWs5UUt3Mk1Gbmd1QlFmNXl4TnpjNXd0UWZSWXVDOUNpMVJnQ29PRlozcnFibTBCMURnM25HdEFiNUtnUURBbGp4REhKN2RNMWdjWTQzWW1HVVZZQjVyOHY2aDFIOFNtM0FhS2x2TkRrTnJrMlE0VTkxdU8zSk9CWmpKU2dPSlpFaUduRmFINmdSazcwdlJWVDJCOUxRU1lyTFIycjhLdWxZWHdVckJBVWJib2NZdWVPc2w0WkNWV2p2bHpGIiwiaXNfYWRtaW4iOnRydWV9LCJpYXQiOjE1NjIwNzY1NjgsImV4cCI6MTU2MjY4MTM2OH0.-aoOzrNQoUK-mahZAlxiA4emewUpv_qcBTjo2pfAtAA')
      .send({
        busId: '234422d3ASRFE',
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

  it('should return all trips', (done) => {
    request(server.server)
      .get('/api/v1/trips/')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJJZCI6InVmOFdTa0FSVVNqZWs5UUt3Mk1Gbmd1QlFmNXl4TnpjNXd0UWZSWXVDOUNpMVJnQ29PRlozcnFibTBCMURnM25HdEFiNUtnUURBbGp4REhKN2RNMWdjWTQzWW1HVVZZQjVyOHY2aDFIOFNtM0FhS2x2TkRrTnJrMlE0VTkxdU8zSk9CWmpKU2dPSlpFaUduRmFINmdSazcwdlJWVDJCOUxRU1lyTFIycjhLdWxZWHdVckJBVWJib2NZdWVPc2w0WkNWV2p2bHpGIiwiaXNfYWRtaW4iOnRydWV9LCJpYXQiOjE1NjIwNzY1NjgsImV4cCI6MTU2MjY4MTM2OH0.-aoOzrNQoUK-mahZAlxiA4emewUpv_qcBTjo2pfAtAA')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
