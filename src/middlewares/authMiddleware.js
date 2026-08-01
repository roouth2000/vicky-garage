"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authMiddleware = void 0;
var _express = require("express");
var _jwt = require("../utils/jwt");
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      message: 'No token provided, authorization denied'
    });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = (0, _jwt.verifyToken)(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Token is not valid'
    });
  }
};
exports.authMiddleware = authMiddleware;