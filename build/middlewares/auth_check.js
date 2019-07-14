"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var jwt = require('jsonwebtoken'); // eslint-disable-next-line no-underscore-dangle


var _response = require('../helpers/response');

module.exports = function (req, res, next) {
  var rtoken;

  if (req.body.token) {
    var _req$body = _slicedToArray(req.body, 1),
        token = _req$body[0];

    rtoken = token;
  } else if (req.param.token) {
    var _res$param = _slicedToArray(res.param, 1),
        _token = _res$param[0];

    rtoken = _token;
  } else if (req.headers.authorization) {
    // eslint-disable-next-line prefer-destructuring
    rtoken = req.headers.authorization.split(' ')[1];
  } // check if an authtorization headeer exixsts


  try {
    var decoded = jwt.verify(rtoken, process.env.JWT_SIGNATURE);
    req.usertoken = jwt.decode(rtoken);
    req.decoded = decoded;
    req.body.token = decoded.data.token;
    req.body.is_admin = decoded.data.is_admin;
    req.body.user_id = decoded.data.user_id;
  } catch (err) {
    return res.status(401).json(_response.error('Token Authentication Failed'));
  }

  return next();
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9taWRkbGV3YXJlcy9hdXRoX2NoZWNrLmpzIl0sIm5hbWVzIjpbImp3dCIsInJlcXVpcmUiLCJfcmVzcG9uc2UiLCJtb2R1bGUiLCJleHBvcnRzIiwicmVxIiwicmVzIiwibmV4dCIsInJ0b2tlbiIsImJvZHkiLCJ0b2tlbiIsInBhcmFtIiwiaGVhZGVycyIsImF1dGhvcml6YXRpb24iLCJzcGxpdCIsImRlY29kZWQiLCJ2ZXJpZnkiLCJwcm9jZXNzIiwiZW52IiwiSldUX1NJR05BVFVSRSIsInVzZXJ0b2tlbiIsImRlY29kZSIsImRhdGEiLCJpc19hZG1pbiIsInVzZXJfaWQiLCJlcnIiLCJzdGF0dXMiLCJqc29uIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxHQUFHLEdBQUdDLE9BQU8sQ0FBQyxjQUFELENBQW5CLEMsQ0FDQTs7O0FBQ0EsSUFBTUMsU0FBUyxHQUFHRCxPQUFPLENBQUMscUJBQUQsQ0FBekI7O0FBRUFFLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQixVQUFDQyxHQUFELEVBQU1DLEdBQU4sRUFBV0MsSUFBWCxFQUFvQjtBQUNuQyxNQUFJQyxNQUFKOztBQUNBLE1BQUlILEdBQUcsQ0FBQ0ksSUFBSixDQUFTQyxLQUFiLEVBQW9CO0FBQUEsbUNBQ0ZMLEdBQUcsQ0FBQ0ksSUFERjtBQUFBLFFBQ1hDLEtBRFc7O0FBRWxCRixJQUFBQSxNQUFNLEdBQUdFLEtBQVQ7QUFDRCxHQUhELE1BR08sSUFBSUwsR0FBRyxDQUFDTSxLQUFKLENBQVVELEtBQWQsRUFBcUI7QUFBQSxvQ0FDVkosR0FBRyxDQUFDSyxLQURNO0FBQUEsUUFDbkJELE1BRG1COztBQUUxQkYsSUFBQUEsTUFBTSxHQUFHRSxNQUFUO0FBQ0QsR0FITSxNQUdBLElBQUlMLEdBQUcsQ0FBQ08sT0FBSixDQUFZQyxhQUFoQixFQUErQjtBQUNwQztBQUNBTCxJQUFBQSxNQUFNLEdBQUdILEdBQUcsQ0FBQ08sT0FBSixDQUFZQyxhQUFaLENBQTBCQyxLQUExQixDQUFnQyxHQUFoQyxFQUFxQyxDQUFyQyxDQUFUO0FBQ0QsR0FYa0MsQ0FZbkM7OztBQUNBLE1BQUk7QUFDRixRQUFNQyxPQUFPLEdBQUdmLEdBQUcsQ0FBQ2dCLE1BQUosQ0FBV1IsTUFBWCxFQUFtQlMsT0FBTyxDQUFDQyxHQUFSLENBQVlDLGFBQS9CLENBQWhCO0FBRUFkLElBQUFBLEdBQUcsQ0FBQ2UsU0FBSixHQUFnQnBCLEdBQUcsQ0FBQ3FCLE1BQUosQ0FBV2IsTUFBWCxDQUFoQjtBQUNBSCxJQUFBQSxHQUFHLENBQUNVLE9BQUosR0FBY0EsT0FBZDtBQUNBVixJQUFBQSxHQUFHLENBQUNJLElBQUosQ0FBU0MsS0FBVCxHQUFpQkssT0FBTyxDQUFDTyxJQUFSLENBQWFaLEtBQTlCO0FBQ0FMLElBQUFBLEdBQUcsQ0FBQ0ksSUFBSixDQUFTYyxRQUFULEdBQW9CUixPQUFPLENBQUNPLElBQVIsQ0FBYUMsUUFBakM7QUFDQWxCLElBQUFBLEdBQUcsQ0FBQ0ksSUFBSixDQUFTZSxPQUFULEdBQW1CVCxPQUFPLENBQUNPLElBQVIsQ0FBYUUsT0FBaEM7QUFDRCxHQVJELENBUUUsT0FBT0MsR0FBUCxFQUFZO0FBQ1osV0FBT25CLEdBQUcsQ0FBQ29CLE1BQUosQ0FBVyxHQUFYLEVBQWdCQyxJQUFoQixDQUFxQnpCLFNBQVMsQ0FBQzBCLEtBQVYsQ0FBZ0IsNkJBQWhCLENBQXJCLENBQVA7QUFDRDs7QUFFRCxTQUFPckIsSUFBSSxFQUFYO0FBQ0QsQ0ExQkQiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBqd3QgPSByZXF1aXJlKCdqc29ud2VidG9rZW4nKTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlcnNjb3JlLWRhbmdsZVxuY29uc3QgX3Jlc3BvbnNlID0gcmVxdWlyZSgnLi4vaGVscGVycy9yZXNwb25zZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICBsZXQgcnRva2VuO1xuICBpZiAocmVxLmJvZHkudG9rZW4pIHtcbiAgICBjb25zdCBbdG9rZW5dID0gcmVxLmJvZHk7XG4gICAgcnRva2VuID0gdG9rZW47XG4gIH0gZWxzZSBpZiAocmVxLnBhcmFtLnRva2VuKSB7XG4gICAgY29uc3QgW3Rva2VuXSA9IHJlcy5wYXJhbTtcbiAgICBydG9rZW4gPSB0b2tlbjtcbiAgfSBlbHNlIGlmIChyZXEuaGVhZGVycy5hdXRob3JpemF0aW9uKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1kZXN0cnVjdHVyaW5nXG4gICAgcnRva2VuID0gcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvbi5zcGxpdCgnICcpWzFdO1xuICB9XG4gIC8vIGNoZWNrIGlmIGFuIGF1dGh0b3JpemF0aW9uIGhlYWRlZXIgZXhpeHN0c1xuICB0cnkge1xuICAgIGNvbnN0IGRlY29kZWQgPSBqd3QudmVyaWZ5KHJ0b2tlbiwgcHJvY2Vzcy5lbnYuSldUX1NJR05BVFVSRSk7XG5cbiAgICByZXEudXNlcnRva2VuID0gand0LmRlY29kZShydG9rZW4pO1xuICAgIHJlcS5kZWNvZGVkID0gZGVjb2RlZDtcbiAgICByZXEuYm9keS50b2tlbiA9IGRlY29kZWQuZGF0YS50b2tlbjtcbiAgICByZXEuYm9keS5pc19hZG1pbiA9IGRlY29kZWQuZGF0YS5pc19hZG1pbjtcbiAgICByZXEuYm9keS51c2VyX2lkID0gZGVjb2RlZC5kYXRhLnVzZXJfaWQ7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbihfcmVzcG9uc2UuZXJyb3IoJ1Rva2VuIEF1dGhlbnRpY2F0aW9uIEZhaWxlZCcpKTtcbiAgfVxuXG4gIHJldHVybiBuZXh0KCk7XG59O1xuIl19