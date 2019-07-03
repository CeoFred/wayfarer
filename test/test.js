const chai = require('chai');
const config = require('../app/config/config');
const server = require('../bin/www');


chai.describe('Server', ()=>{
  chai.it('tests that server is running current port', async () => {
    chai.expect(server.port).to.equal(config.server.port);
  });
});