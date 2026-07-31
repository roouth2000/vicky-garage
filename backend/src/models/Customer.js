"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initCustomer = exports.Customer = void 0;
var _sequelize = require("sequelize");
class Customer extends _sequelize.Model {
  id;
  vehicle_number;
  vehicle_model;
  km_driven;
  customer_name;
  mobile_number;
  created_at;
  updated_at;
}
exports.Customer = Customer;
const initCustomer = sequelize => {
  Customer.init({
    id: {
      type: _sequelize.DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    vehicle_number: {
      type: _sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    vehicle_model: {
      type: _sequelize.DataTypes.STRING,
      allowNull: false
    },
    km_driven: {
      type: _sequelize.DataTypes.INTEGER,
      defaultValue: 0
    },
    customer_name: {
      type: _sequelize.DataTypes.STRING,
      defaultValue: ''
    },
    mobile_number: {
      type: _sequelize.DataTypes.STRING,
      defaultValue: ''
    }
  }, {
    sequelize,
    tableName: 'customers',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
exports.initCustomer = initCustomer;