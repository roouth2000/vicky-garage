import { Sequelize } from 'sequelize';
import { initModels } from '../models';
import bcrypt from 'bcryptjs';

// Setup Sequelize to connect to MySQL
const dbName = process.env.DB_NAME || 'garage_billing';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: false, // Set to console.log to see SQL queries
});

export async function initDatabase() {
  try {
    // Authenticate connection
    await sequelize.authenticate();
    console.log('Connected to MySQL successfully.');

    // Initialize models
    const { User, Product, Customer, Bill, BillItem } = initModels(sequelize);

    // Sync all models (create tables if they do not exist)
    await sequelize.sync({ alter: true }); // alter updates schema if changed without dropping

    // Seed default admin
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('Seeding default admin user...');
      const defaultPassword = 'admin';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await User.create({
        username: 'admin',
        password_hash: hashedPassword,
        role: 'admin',
      });
    }

    // Seed sample products
    const productCount = await Product.count();
    if (productCount === 0) {
      console.log('Seeding initial products...');
      const sampleProducts = [
        { name: 'OIL & OIL FILTER', stock_qty: 25, selling_price: 1650.00 },
        { name: 'CLUTCH CABLE', stock_qty: 15, selling_price: 220.00 },
        { name: 'FRONT DISC PAD', stock_qty: 12, selling_price: 250.00 },
        { name: 'GRIP SET', stock_qty: 20, selling_price: 140.00 },
        { name: 'REAR DISC PAD', stock_qty: 10, selling_price: 250.00 },
        { name: 'REAR SHOCKHOSPER', stock_qty: 5, selling_price: 4200.00 },
        { name: 'SHOCKHOSPER HARM', stock_qty: 8, selling_price: 1850.00 },
        { name: 'DROP LINK SUB ASSEMBLY', stock_qty: 6, selling_price: 1253.00 },
        { name: 'COURIER CHARGE', stock_qty: 999, selling_price: 350.00 },
        { name: 'WATER WASH', stock_qty: 999, selling_price: 250.00 },
        { name: 'DISC OIL', stock_qty: 30, selling_price: 120.00 },
        { name: 'CHAIN LUBE', stock_qty: 40, selling_price: 100.00 },
        { name: 'LABOUR', stock_qty: 999, selling_price: 2850.00 },
        { name: 'SPARK PLUG TWIN', stock_qty: 18, selling_price: 450.00 },
        { name: 'AIR FILTER ELEMENT', stock_qty: 14, selling_price: 380.00 }
      ];
      await Product.bulkCreate(sampleProducts);
    }

    // Seed sample customers & bill
    const customerCount = await Customer.count();
    if (customerCount === 0) {
      console.log('Seeding sample customers & bill...');
      const sampleCustomers = [
        { vehicle_number: 'TN 02 BV 7500', vehicle_model: 'HIMALAYAN', km_driven: 8047, customer_name: 'U.Vignesh Kumar', mobile_number: '+91 98400 12345' },
        { vehicle_number: 'TN 09 CB 4411', vehicle_model: 'CLASSIC 350', km_driven: 14200, customer_name: 'Rajesh R.', mobile_number: '+91 98841 99882' },
        { vehicle_number: 'TN 07 DC 1289', vehicle_model: 'METEOR 350', km_driven: 6200, customer_name: 'Karthik S.', mobile_number: '+91 97910 44321' }
      ];
      await Customer.bulkCreate(sampleCustomers);

      const cust = await Customer.findOne({ where: { vehicle_number: 'TN 02 BV 7500' } });
      
      const bill = await Bill.create({
        bill_no: 1,
        customer_id: cust ? cust.id : null,
        vehicle_number: 'TN 02 BV 7500',
        vehicle_model: 'HIMALAYAN',
        customer_name: 'U.Vignesh Kumar',
        mobile_number: '+91 98400 12345',
        km_driven: 8047,
        bill_date: '2026-07-23',
        total_amount: 13483.00,
        advance_amount: 0,
        balance_amount: 13483.00,
        complaint: 'General Service, Front & Rear brake noise check, Chain adjustment.'
      });

      const items = [
        { bill_id: bill.id, s_no: 1, product_name: 'OIL & OIL FILTER', qty: 1, amount: 1650.00 },
        { bill_id: bill.id, s_no: 2, product_name: 'CLUTCH CABLE', qty: 1, amount: 220.00 },
        { bill_id: bill.id, s_no: 3, product_name: 'FRONT DISC PAD', qty: 1, amount: 250.00 },
        { bill_id: bill.id, s_no: 4, product_name: 'GRIP SET', qty: 1, amount: 140.00 },
        { bill_id: bill.id, s_no: 5, product_name: 'REAR DISC PAD', qty: 1, amount: 250.00 },
        { bill_id: bill.id, s_no: 6, product_name: 'REAR SHOCKHOSPER', qty: 1, amount: 4200.00 },
        { bill_id: bill.id, s_no: 7, product_name: 'SHOCKHOSPER HARM', qty: 1, amount: 1850.00 },
        { bill_id: bill.id, s_no: 8, product_name: 'DROP LINK SUB ASSEMBLY', qty: 1, amount: 1253.00 },
        { bill_id: bill.id, s_no: 9, product_name: 'COURIER CHARGE', qty: 1, amount: 350.00 },
        { bill_id: bill.id, s_no: 10, product_name: 'WATER WASH', qty: 1, amount: 250.00 },
        { bill_id: bill.id, s_no: 11, product_name: 'DISC OIL', qty: 1, amount: 120.00 },
        { bill_id: bill.id, s_no: 12, product_name: 'CHAIN LUBE', qty: 1, amount: 100.00 },
        { bill_id: bill.id, s_no: 13, product_name: 'LABOUR', qty: 1, amount: 2850.00 }
      ];
      await BillItem.bulkCreate(items);
    }

  } catch (error) {
    console.error('Unable to connect to MySQL database:', error);
    throw error;
  }
}


