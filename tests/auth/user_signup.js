// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../bin/www');
const expect = chai.expect;
// const should = chai.should();

chai.use(chaiHttp);
describe('/POST Users', () => {
    it('it should Register a new user', (done) => {
        chai.request(server.server)
            .post('/api/v1/user/signup')
            .set('Content-Type','Application/json')
            .send({password: 'messilo18_',lastName : 'okb',firstName: 'kb',email:'handy@gmail.com' })
            .end((err,res) => {
              expect(res).to.have.status(201);
              done()
           })
    }).timeout(10000);
  });
