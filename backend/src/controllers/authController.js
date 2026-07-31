"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.login = void 0;
var _express = require("express");
var _models = require("../models");
var _hash = require("../utils/hash");
var _jwt = require("../utils/jwt");
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
const login = async (req, res) => {
  try {
    const {
      username,
      password
    } = req.body;
    const user = await _models.User.findOne({
      where: {
        username
      }
    });
    if (!user) {
      res.status(401).json({
        message: 'Invalid credentials'
      });
      return;
    }
    const isMatch = await (0, _hash.comparePassword)(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({
        message: 'Invalid credentials'
      });
      return;
    }
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
    const token = (0, _jwt.generateToken)(payload);
    res.json({
      token,
      user: payload.user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error: ' + error.message,
      stack: error.stack
    });
  }
};
exports.login = login;