const jwt = require('jsonwebtoken');

module.exports = {
  randomString(length) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHUJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i += 1) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result.trim();
  },
  signToken(data) {
    const token = jwt.sign({ data },
      process.env.JWT_SIGNATURE,
      {
        expiresIn: '7d',
        mutatePayload: true,
      });
    return token;
  }
};
