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
  } catch (err) {
    return res.status(401).json(_response.error('Token Authentication Failed'));
  }

  return next();
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9taWRkbGV3YXJlcy9hdXRoX2NoZWNrLmpzIl0sIm5hbWVzIjpbImp3dCIsInJlcXVpcmUiLCJfcmVzcG9uc2UiLCJtb2R1bGUiLCJleHBvcnRzIiwicmVxIiwicmVzIiwibmV4dCIsInJ0b2tlbiIsImJvZHkiLCJ0b2tlbiIsInBhcmFtIiwiaGVhZGVycyIsImF1dGhvcml6YXRpb24iLCJzcGxpdCIsImRlY29kZWQiLCJ2ZXJpZnkiLCJwcm9jZXNzIiwiZW52IiwiSldUX1NJR05BVFVSRSIsInVzZXJ0b2tlbiIsImRlY29kZSIsImVyciIsInN0YXR1cyIsImpzb24iLCJlcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLEdBQUcsR0FBR0MsT0FBTyxDQUFDLGNBQUQsQ0FBbkIsQyxDQUNBOzs7QUFDQSxJQUFNQyxTQUFTLEdBQUdELE9BQU8sQ0FBQyxxQkFBRCxDQUF6Qjs7QUFFQUUsTUFBTSxDQUFDQyxPQUFQLEdBQWlCLFVBQUNDLEdBQUQsRUFBTUMsR0FBTixFQUFXQyxJQUFYLEVBQW9CO0FBQ25DLE1BQUlDLE1BQUo7O0FBQ0EsTUFBSUgsR0FBRyxDQUFDSSxJQUFKLENBQVNDLEtBQWIsRUFBb0I7QUFBQSxtQ0FDRkwsR0FBRyxDQUFDSSxJQURGO0FBQUEsUUFDWEMsS0FEVzs7QUFFbEJGLElBQUFBLE1BQU0sR0FBR0UsS0FBVDtBQUNELEdBSEQsTUFHTyxJQUFJTCxHQUFHLENBQUNNLEtBQUosQ0FBVUQsS0FBZCxFQUFxQjtBQUFBLG9DQUNWSixHQUFHLENBQUNLLEtBRE07QUFBQSxRQUNuQkQsTUFEbUI7O0FBRTFCRixJQUFBQSxNQUFNLEdBQUdFLE1BQVQ7QUFDRCxHQUhNLE1BR0EsSUFBSUwsR0FBRyxDQUFDTyxPQUFKLENBQVlDLGFBQWhCLEVBQStCO0FBQ3BDO0FBQ0FMLElBQUFBLE1BQU0sR0FBR0gsR0FBRyxDQUFDTyxPQUFKLENBQVlDLGFBQVosQ0FBMEJDLEtBQTFCLENBQWdDLEdBQWhDLEVBQXFDLENBQXJDLENBQVQ7QUFDRCxHQVhrQyxDQVluQzs7O0FBQ0EsTUFBSTtBQUNGLFFBQU1DLE9BQU8sR0FBR2YsR0FBRyxDQUFDZ0IsTUFBSixDQUFXUixNQUFYLEVBQW1CUyxPQUFPLENBQUNDLEdBQVIsQ0FBWUMsYUFBL0IsQ0FBaEI7QUFFQWQsSUFBQUEsR0FBRyxDQUFDZSxTQUFKLEdBQWdCcEIsR0FBRyxDQUFDcUIsTUFBSixDQUFXYixNQUFYLENBQWhCO0FBQ0FILElBQUFBLEdBQUcsQ0FBQ1UsT0FBSixHQUFjQSxPQUFkO0FBQ0QsR0FMRCxDQUtFLE9BQU9PLEdBQVAsRUFBWTtBQUNaLFdBQU9oQixHQUFHLENBQUNpQixNQUFKLENBQVcsR0FBWCxFQUFnQkMsSUFBaEIsQ0FBcUJ0QixTQUFTLENBQUN1QixLQUFWLENBQWdCLDZCQUFoQixDQUFyQixDQUFQO0FBQ0Q7O0FBRUQsU0FBT2xCLElBQUksRUFBWDtBQUNELENBdkJEIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgand0ID0gcmVxdWlyZSgnanNvbndlYnRva2VuJyk7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZXJzY29yZS1kYW5nbGVcbmNvbnN0IF9yZXNwb25zZSA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcmVzcG9uc2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgbGV0IHJ0b2tlbjtcbiAgaWYgKHJlcS5ib2R5LnRva2VuKSB7XG4gICAgY29uc3QgW3Rva2VuXSA9IHJlcS5ib2R5O1xuICAgIHJ0b2tlbiA9IHRva2VuO1xuICB9IGVsc2UgaWYgKHJlcS5wYXJhbS50b2tlbikge1xuICAgIGNvbnN0IFt0b2tlbl0gPSByZXMucGFyYW07XG4gICAgcnRva2VuID0gdG9rZW47XG4gIH0gZWxzZSBpZiAocmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvbikge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItZGVzdHJ1Y3R1cmluZ1xuICAgIHJ0b2tlbiA9IHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb24uc3BsaXQoJyAnKVsxXTtcbiAgfVxuICAvLyBjaGVjayBpZiBhbiBhdXRodG9yaXphdGlvbiBoZWFkZWVyIGV4aXhzdHNcbiAgdHJ5IHtcbiAgICBjb25zdCBkZWNvZGVkID0gand0LnZlcmlmeShydG9rZW4sIHByb2Nlc3MuZW52LkpXVF9TSUdOQVRVUkUpO1xuXG4gICAgcmVxLnVzZXJ0b2tlbiA9IGp3dC5kZWNvZGUocnRva2VuKTtcbiAgICByZXEuZGVjb2RlZCA9IGRlY29kZWQ7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiByZXMuc3RhdHVzKDQwMSkuanNvbihfcmVzcG9uc2UuZXJyb3IoJ1Rva2VuIEF1dGhlbnRpY2F0aW9uIEZhaWxlZCcpKTtcbiAgfVxuXG4gIHJldHVybiBuZXh0KCk7XG59O1xuIl19