const jwt = require('jsonwebtoken');
// eslint-disable-next-line no-underscore-dangle
const _response = require('../helpers/response');

module.exports = (req, res, next) => {
  let rtoken;
  if (req.body.token) {
    const [token] = req.body;
    rtoken = token;
  } else if (req.param.token) {
    const [token] = res.param;
    rtoken = token;
  } else if (req.headers.authorization) {
    // eslint-disable-next-line prefer-destructuring
    rtoken = req.headers.authorization.split(' ')[1];
  }
  // check if an authtorization headeer exixsts
  try {
    const decoded = jwt.verify(rtoken, process.env.JWT_SIGNATURE);

    req.usertoken = jwt.decode(rtoken);
    req.decoded = decoded;
  } catch (err) {
    return res.status(401).json(_response.error('Token Authentication Failed'));
  }

  return next();
};
