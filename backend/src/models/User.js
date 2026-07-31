"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initUser = exports.User = void 0;
var _sequelize = require("sequelize");
class User extends _sequelize.Model {
  id;
  username;
  password_hash;
  role;
  created_at;
  updated_at;
}
exports.User = User;
const initUser = sequelize => {
  User.init({
    id: {
      type: _sequelize.DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: _sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: _sequelize.DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: _sequelize.DataTypes.STRING,
      defaultValue: 'admin'
    }
  }, {
    sequelize,
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
exports.initUser = initUser;