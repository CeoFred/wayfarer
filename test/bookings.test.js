const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../bin/www');

const { expect } = chai;
const db = require('../app/config/db');
const config = require('../app/config/config');

chai.use(chaiHttp);

describe('Booking Test', () => {
  it('Should book a trip', () => {

  });
});
