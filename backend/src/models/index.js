"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Bill", {
  enumerable: true,
  get: function () {
    return _Bill.Bill;
  }
});
Object.defineProperty(exports, "BillItem", {
  enumerable: true,
  get: function () {
    return _BillItem.BillItem;
  }
});
Object.defineProperty(exports, "Customer", {
  enumerable: true,
  get: function () {
    return _Customer.Customer;
  }
});
Object.defineProperty(exports, "Expense", {
  enumerable: true,
  get: function () {
    return _Expense.Expense;
  }
});
Object.defineProperty(exports, "Product", {
  enumerable: true,
  get: function () {
    return _Product.Product;
  }
});
Object.defineProperty(exports, "User", {
  enumerable: true,
  get: function () {
    return _User.User;
  }
});
exports.initModels = void 0;
var _sequelize = require("sequelize");
var _User = require("./User");
var _Product = require("./Product");
var _Customer = require("./Customer");
var _Expense = require("./Expense");
var _Bill = require("./Bill");
var _BillItem = require("./BillItem");
const initModels = sequelize => {
  (0, _User.initUser)(sequelize);
  (0, _Product.initProduct)(sequelize);
  (0, _Customer.initCustomer)(sequelize);
  (0, _Expense.initExpense)(sequelize);
  (0, _Bill.initBill)(sequelize);
  (0, _BillItem.initBillItem)(sequelize);

  // Define relationships
  _Customer.Customer.hasMany(_Bill.Bill, {
    foreignKey: 'customer_id'
  });
  _Bill.Bill.belongsTo(_Customer.Customer, {
    foreignKey: 'customer_id'
  });
  _Bill.Bill.hasMany(_BillItem.BillItem, {
    foreignKey: 'bill_id',
    as: 'items'
  });
  _BillItem.BillItem.belongsTo(_Bill.Bill, {
    foreignKey: 'bill_id'
  });
  return {
    User: _User.User,
    Product: _Product.Product,
    Customer: _Customer.Customer,
    Expense: _Expense.Expense,
    Bill: _Bill.Bill,
    BillItem: _BillItem.BillItem
  };
};
exports.initModels = initModels;