import { Sequelize } from 'sequelize';
import { User, initUser } from './User';
import { Product, initProduct } from './Product';
import { Customer, initCustomer } from './Customer';
import { Expense, initExpense } from './Expense';
import { Bill, initBill } from './Bill';
import { BillItem, initBillItem } from './BillItem';

export const initModels = (sequelize: Sequelize) => {
  initUser(sequelize);
  initProduct(sequelize);
  initCustomer(sequelize);
  initExpense(sequelize);
  initBill(sequelize);
  initBillItem(sequelize);

  // Define relationships
  Customer.hasMany(Bill, { foreignKey: 'customer_id' });
  Bill.belongsTo(Customer, { foreignKey: 'customer_id' });

  Bill.hasMany(BillItem, { foreignKey: 'bill_id', as: 'items' });
  BillItem.belongsTo(Bill, { foreignKey: 'bill_id' });

  return { User, Product, Customer, Expense, Bill, BillItem };
};

export { User, Product, Customer, Expense, Bill, BillItem };
