"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyToken = exports.generateToken = void 0;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';
const JWT_EXPIRES_IN = '1d';
const generateToken = payload => {
  return _jsonwebtoken.default.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};
exports.generateToken = generateToken;
const verifyToken = token => {
  return _jsonwebtoken.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;