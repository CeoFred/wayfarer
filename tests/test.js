/* eslint-disable no-undef */
const chai = require('chai')
const config = require('../app/config/config');
const server = require('../bin/www');

describe('Server', () => {
  it('tests that server is running current port', async () => {
    await chai.expect(server.port).to.equal(config.server.port);
  });
});
