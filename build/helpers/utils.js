"use strict";

module.exports = {
  randomString: function randomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHUJKLMNOPQRSTUVWXYZ';
    var result = '';

    for (var i = 0; i < length; i += 1) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result.trim();
  }
};
//# sourceMappingURL=utils.js.map