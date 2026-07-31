"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbAll = exports.dbGet = exports.dbRun = exports.db = void 0;
exports.logSqlError = logSqlError;
exports.initDatabase = initDatabase;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Helper function to log detailed SQLite / DB errors as required
function logSqlError(context, error) {
    console.error(`--- SQLITE ERROR DETECTED (${context}) ---`);
    console.error('Stack Trace:', error?.stack || error);
    console.error('Database Path:', dbPath);
    console.error('Current Working Directory:', process.cwd());
    console.error('SQLite Error Code:', error?.code || 'N/A');
    console.error('-------------------------------------------');
}
const targetDir = process.cwd().endsWith('backend')
    ? process.cwd()
    : path_1.default.resolve(process.cwd(), 'backend');
const dbPath = path_1.default.resolve(targetDir, 'garage_billing.db');
// Ensure database directory exists
if (!fs_1.default.existsSync(targetDir)) {
    fs_1.default.mkdirSync(targetDir, { recursive: true });
}
// Check database file existence and write permissions
const dbExists = fs_1.default.existsSync(dbPath);
let dbWritable = false;
try {
    if (dbExists) {
        fs_1.default.accessSync(dbPath, fs_1.default.constants.W_OK);
        dbWritable = true;
    }
    else {
        // Check if target directory is writable to create database file
        fs_1.default.accessSync(targetDir, fs_1.default.constants.W_OK);
        dbWritable = true;
    }
}
catch (permErr) {
    console.error(`Permission check failed for database at path: ${dbPath}`);
    console.error(`Error details:`, permErr);
    dbWritable = false;
}
console.log(`Database path: ${dbPath}`);
console.log(`Database exists: ${dbExists}`);
console.log(`Database writable: ${dbWritable}`);
exports.db = new sqlite3_1.default.Database(dbPath, sqlite3_1.default.OPEN_READWRITE | sqlite3_1.default.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Failed to open database connection:', err.message);
        logSqlError('Database Connection Open', err);
    }
    else {
        console.log('Connected successfully.');
    }
});
// Helper for promise-based db queries with detailed error logging
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        exports.db.run(sql, params, function (err) {
            if (err) {
                logSqlError(`dbRun query: ${sql}`, err);
                reject(err);
            }
            else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};
exports.dbRun = dbRun;
const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        exports.db.get(sql, params, (err, row) => {
            if (err) {
                logSqlError(`dbGet query: ${sql}`, err);
                reject(err);
            }
            else {
                resolve(row);
            }
        });
    });
};
exports.dbGet = dbGet;
const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        exports.db.all(sql, params, (err, rows) => {
            if (err) {
                logSqlError(`dbAll query: ${sql}`, err);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
};
exports.dbAll = dbAll;
async function initDatabase() {
    await (0, exports.dbRun)('PRAGMA foreign_keys = ON;');
    // Products Table
    await (0, exports.dbRun)(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      stock_qty INTEGER DEFAULT 0,
      selling_price REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // Customers Table
    await (0, exports.dbRun)(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_number TEXT UNIQUE NOT NULL,
      vehicle_model TEXT NOT NULL,
      km_driven INTEGER DEFAULT 0,
      customer_name TEXT DEFAULT '',
      mobile_number TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // Bills Table
    await (0, exports.dbRun)(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_no INTEGER UNIQUE NOT NULL,
      customer_id INTEGER,
      vehicle_number TEXT NOT NULL,
      vehicle_model TEXT,
      customer_name TEXT,
      mobile_number TEXT,
      km_driven INTEGER,
      bill_date TEXT NOT NULL,
      total_amount REAL NOT NULL,
      advance_amount REAL DEFAULT 0,
      balance_amount REAL NOT NULL,
      complaint TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    );
  `);
    // Bill Items Table
    await (0, exports.dbRun)(`
    CREATE TABLE IF NOT EXISTS bill_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id INTEGER NOT NULL,
      s_no INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      qty REAL DEFAULT 1,
      amount REAL NOT NULL,
      FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
    );
  `);
    // Expenses Table
    await (0, exports.dbRun)(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      remarks TEXT,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // Seed sample products & customers if empty
    const productCount = await (0, exports.dbGet)('SELECT COUNT(*) as count FROM products');
    if (productCount && productCount.count === 0) {
        console.log('Seeding initial products & sample bill data...');
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
        for (const prod of sampleProducts) {
            await (0, exports.dbRun)('INSERT INTO products (name, stock_qty, selling_price) VALUES (?, ?, ?)', [prod.name, prod.stock_qty, prod.selling_price]);
        }
    }
    const customerCount = await (0, exports.dbGet)('SELECT COUNT(*) as count FROM customers');
    if (customerCount && customerCount.count === 0) {
        const sampleCustomers = [
            {
                vehicle_number: 'TN 02 BV 7500',
                vehicle_model: 'HIMALAYAN',
                km_driven: 8047,
                customer_name: 'U.Vignesh Kumar',
                mobile_number: '+91 98400 12345'
            },
            {
                vehicle_number: 'TN 09 CB 4411',
                vehicle_model: 'CLASSIC 350',
                km_driven: 14200,
                customer_name: 'Rajesh R.',
                mobile_number: '+91 98841 99882'
            },
            {
                vehicle_number: 'TN 07 DC 1289',
                vehicle_model: 'METEOR 350',
                km_driven: 6200,
                customer_name: 'Karthik S.',
                mobile_number: '+91 97910 44321'
            }
        ];
        for (const cust of sampleCustomers) {
            await (0, exports.dbRun)('INSERT INTO customers (vehicle_number, vehicle_model, km_driven, customer_name, mobile_number) VALUES (?, ?, ?, ?, ?)', [cust.vehicle_number, cust.vehicle_model, cust.km_driven, cust.customer_name, cust.mobile_number]);
        }
        // Seed Sample Bill 001 matching sample image
        const sampleBill = {
            bill_no: 1,
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
        };
        const cust = await (0, exports.dbGet)('SELECT id FROM customers WHERE vehicle_number = ?', [sampleBill.vehicle_number]);
        const res = await (0, exports.dbRun)(`INSERT INTO bills (bill_no, customer_id, vehicle_number, vehicle_model, customer_name, mobile_number, km_driven, bill_date, total_amount, advance_amount, balance_amount, complaint)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            sampleBill.bill_no,
            cust ? cust.id : null,
            sampleBill.vehicle_number,
            sampleBill.vehicle_model,
            sampleBill.customer_name,
            sampleBill.mobile_number,
            sampleBill.km_driven,
            sampleBill.bill_date,
            sampleBill.total_amount,
            sampleBill.advance_amount,
            sampleBill.balance_amount,
            sampleBill.complaint
        ]);
        const billId = res.lastID;
        const items = [
            { s_no: 1, product_name: 'OIL & OIL FILTER', qty: 1, amount: 1650.00 },
            { s_no: 2, product_name: 'CLUTCH CABLE', qty: 1, amount: 220.00 },
            { s_no: 3, product_name: 'FRONT DISC PAD', qty: 1, amount: 250.00 },
            { s_no: 4, product_name: 'GRIP SET', qty: 1, amount: 140.00 },
            { s_no: 5, product_name: 'REAR DISC PAD', qty: 1, amount: 250.00 },
            { s_no: 6, product_name: 'REAR SHOCKHOSPER', qty: 1, amount: 4200.00 },
            { s_no: 7, product_name: 'SHOCKHOSPER HARM', qty: 1, amount: 1850.00 },
            { s_no: 8, product_name: 'DROP LINK SUB ASSEMBLY', qty: 1, amount: 1253.00 },
            { s_no: 9, product_name: 'COURIER CHARGE', qty: 1, amount: 350.00 },
            { s_no: 10, product_name: 'WATER WASH', qty: 1, amount: 250.00 },
            { s_no: 11, product_name: 'DISC OIL', qty: 1, amount: 120.00 },
            { s_no: 12, product_name: 'CHAIN LUBE', qty: 1, amount: 100.00 },
            { s_no: 13, product_name: 'LABOUR', qty: 1, amount: 2850.00 }
        ];
        for (const item of items) {
            await (0, exports.dbRun)('INSERT INTO bill_items (bill_id, s_no, product_name, qty, amount) VALUES (?, ?, ?, ?, ?)', [billId, item.s_no, item.product_name, item.qty, item.amount]);
        }
    }
}
