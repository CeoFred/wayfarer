"use strict";

var success = function success(data) {
  return {
    status: 'success',
    data: data
  };
};

var error = function error(msg) {
  return {
    status: 'erorr',
    error: msg
  };
};

module.exports = {
  error: error,
  success: success
};
//# sourceMappingURL=response.js.map