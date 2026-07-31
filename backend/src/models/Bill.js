"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initBill = exports.Bill = void 0;
var _sequelize = require("sequelize");
var _Customer = require("./Customer");
class Bill extends _sequelize.Model {
  id;
  bill_no;
  customer_id;
  vehicle_number;
  vehicle_model;
  customer_name;
  mobile_number;
  km_driven;
  bill_date;
  total_amount;
  advance_amount;
  balance_amount;
  complaint;
  created_at;
}
exports.Bill = Bill;
const initBill = sequelize => {
  Bill.init({
    id: {
      type: _sequelize.DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    bill_no: {
      type: _sequelize.DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    customer_id: {
      type: _sequelize.DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    vehicle_number: {
      type: _sequelize.DataTypes.STRING,
      allowNull: false
    },
    vehicle_model: {
      type: _sequelize.DataTypes.STRING,
      allowNull: true
    },
    customer_name: {
      type: _sequelize.DataTypes.STRING,
      allowNull: true
    },
    mobile_number: {
      type: _sequelize.DataTypes.STRING,
      allowNull: true
    },
    km_driven: {
      type: _sequelize.DataTypes.INTEGER,
      allowNull: true
    },
    bill_date: {
      type: _sequelize.DataTypes.STRING,
      allowNull: false
    },
    total_amount: {
      type: _sequelize.DataTypes.FLOAT,
      allowNull: false
    },
    advance_amount: {
      type: _sequelize.DataTypes.FLOAT,
      defaultValue: 0
    },
    balance_amount: {
      type: _sequelize.DataTypes.FLOAT,
      allowNull: false
    },
    complaint: {
      type: _sequelize.DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'bills',
    createdAt: 'created_at',
    updatedAt: false
  });
};
exports.initBill = initBill;