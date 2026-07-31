"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hashPassword = exports.comparePassword = void 0;
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const hashPassword = async password => {
  const salt = await _bcryptjs.default.genSalt(10);
  return _bcryptjs.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
  return _bcryptjs.default.compare(password, hash);
};
exports.comparePassword = comparePassword;