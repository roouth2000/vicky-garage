"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initBillItem = exports.BillItem = void 0;
var _sequelize = require("sequelize");
var _Bill = require("./Bill");
class BillItem extends _sequelize.Model {
  id;
  bill_id;
  s_no;
  product_name;
  qty;
  amount;
}
exports.BillItem = BillItem;
const initBillItem = sequelize => {
  BillItem.init({
    id: {
      type: _sequelize.DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    bill_id: {
      type: _sequelize.DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bills',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    s_no: {
      type: _sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    product_name: {
      type: _sequelize.DataTypes.STRING,
      allowNull: false
    },
    qty: {
      type: _sequelize.DataTypes.FLOAT,
      defaultValue: 1
    },
    amount: {
      type: _sequelize.DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'bill_items',
    timestamps: false
  });
};
exports.initBillItem = initBillItem;