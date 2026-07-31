"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePdf = exports.getDashboardStats = exports.deleteBill = exports.updateBill = exports.createBill = exports.getBillById = exports.getBills = exports.getNextBillNo = void 0;
const database_1 = require("../db/database");
const expenseController_1 = require("./expenseController");
const puppeteer_1 = __importDefault(require("puppeteer"));
const getNextBillNo = async (req, res) => {
    try {
        const row = await (0, database_1.dbGet)('SELECT MAX(bill_no) as maxBillNo FROM bills');
        const nextBillNo = (row && row.maxBillNo ? row.maxBillNo : 0) + 1;
        res.json({ success: true, nextBillNo });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getNextBillNo = getNextBillNo;
const getBills = async (req, res) => {
    try {
        const search = req.query.search || '';
        const startDate = req.query.startDate || '';
        const endDate = req.query.endDate || '';
        let sql = 'SELECT * FROM bills WHERE 1=1';
        let params = [];
        if (search) {
            sql += ' AND (vehicle_number LIKE ? OR customer_name LIKE ? OR mobile_number LIKE ? OR CAST(bill_no AS TEXT) LIKE ?';
            const term = `%${search}%`;
            params.push(term, term, term, term);
            const parsedNum = parseInt(search, 10);
            if (!isNaN(parsedNum)) {
                sql += ' OR bill_no = ?';
                params.push(parsedNum);
            }
            sql += ')';
        }
        if (startDate) {
            sql += ' AND bill_date >= ?';
            params.push(startDate);
        }
        if (endDate) {
            sql += ' AND bill_date <= ?';
            params.push(endDate);
        }
        sql += ' ORDER BY bill_no DESC';
        const bills = await (0, database_1.dbAll)(sql, params);
        res.json({ success: true, data: bills });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getBills = getBills;
const getBillById = async (req, res) => {
    try {
        const { id } = req.params;
        const bill = await (0, database_1.dbGet)('SELECT * FROM bills WHERE id = ?', [id]);
        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        const items = await (0, database_1.dbAll)('SELECT * FROM bill_items WHERE bill_id = ? ORDER BY s_no ASC', [id]);
        res.json({ success: true, data: { ...bill, items } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getBillById = getBillById;
const createBill = async (req, res) => {
    try {
        const { bill_no, vehicle_number, vehicle_model, customer_name, mobile_number, km_driven, bill_date, total_amount, advance_amount, complaint, items } = req.body;
        if (!vehicle_number || !bill_date || !items || !Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'Vehicle number, date, and items are required' });
        }
        const cleanVehicle = vehicle_number.trim().toUpperCase();
        const cleanModel = (vehicle_model || '').trim();
        const cleanName = (customer_name || '').trim();
        const cleanMobile = (mobile_number || '').trim();
        const kmNum = Number(km_driven) || 0;
        const totalNum = Number(total_amount) || 0;
        const advanceNum = Number(advance_amount) || 0;
        const balanceNum = totalNum - advanceNum;
        // 1. Auto-update or auto-create Customer Master
        let customerId = null;
        const existingCust = await (0, database_1.dbGet)('SELECT id FROM customers WHERE vehicle_number = ?', [cleanVehicle]);
        if (existingCust) {
            customerId = existingCust.id;
            await (0, database_1.dbRun)('UPDATE customers SET vehicle_model = ?, customer_name = ?, mobile_number = ?, km_driven = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [cleanModel || '', cleanName, cleanMobile, kmNum, customerId]);
        }
        else {
            const custRes = await (0, database_1.dbRun)('INSERT INTO customers (vehicle_number, vehicle_model, km_driven, customer_name, mobile_number) VALUES (?, ?, ?, ?, ?)', [cleanVehicle, cleanModel || '', kmNum, cleanName, cleanMobile]);
            customerId = custRes.lastID;
        }
        // Determine bill number
        let finalBillNo = bill_no;
        if (!finalBillNo) {
            const maxRow = await (0, database_1.dbGet)('SELECT MAX(bill_no) as maxBillNo FROM bills');
            finalBillNo = (maxRow && maxRow.maxBillNo ? maxRow.maxBillNo : 0) + 1;
        }
        // 2. Insert Bill
        const billRes = await (0, database_1.dbRun)(`INSERT INTO bills (bill_no, customer_id, vehicle_number, vehicle_model, customer_name, mobile_number, km_driven, bill_date, total_amount, advance_amount, balance_amount, complaint)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            finalBillNo,
            customerId,
            cleanVehicle,
            cleanModel,
            cleanName,
            cleanMobile,
            kmNum,
            bill_date,
            totalNum,
            advanceNum,
            balanceNum,
            complaint || ''
        ]);
        const newBillId = billRes.lastID;
        // 3. Process items & Auto-create Products into Product Master
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const prodName = (item.product_name || '').trim().toUpperCase();
            const qty = Number(item.qty) || 1;
            const amount = Number(item.amount) || 0;
            if (prodName !== '' && amount >= 0) {
                // Check Product Master auto-update/create
                const existingProd = await (0, database_1.dbGet)('SELECT id FROM products WHERE name = ?', [prodName]);
                if (!existingProd) {
                    // Auto-insert product into master
                    const unitPrice = qty > 0 ? amount / qty : amount;
                    await (0, database_1.dbRun)('INSERT INTO products (name, stock_qty, selling_price) VALUES (?, ?, ?)', [prodName, 100, unitPrice]);
                }
                // Insert item line
                await (0, database_1.dbRun)('INSERT INTO bill_items (bill_id, s_no, product_name, qty, amount) VALUES (?, ?, ?, ?, ?)', [newBillId, item.s_no || (i + 1), prodName, qty, amount]);
            }
        }
        const createdBill = await (0, database_1.dbGet)('SELECT * FROM bills WHERE id = ?', [newBillId]);
        const insertedItems = await (0, database_1.dbAll)('SELECT * FROM bill_items WHERE bill_id = ? ORDER BY s_no ASC', [newBillId]);
        res.status(201).json({ success: true, data: { ...createdBill, items: insertedItems } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createBill = createBill;
const updateBill = async (req, res) => {
    try {
        const { id } = req.params;
        const { vehicle_number, vehicle_model, customer_name, mobile_number, km_driven, bill_date, total_amount, advance_amount, complaint, items } = req.body;
        const existingBill = await (0, database_1.dbGet)('SELECT * FROM bills WHERE id = ?', [id]);
        if (!existingBill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        const cleanVehicle = vehicle_number ? vehicle_number.trim().toUpperCase() : existingBill.vehicle_number;
        const cleanModel = vehicle_model !== undefined ? vehicle_model.trim() : existingBill.vehicle_model;
        const cleanName = customer_name !== undefined ? customer_name.trim() : existingBill.customer_name;
        const cleanMobile = mobile_number !== undefined ? mobile_number.trim() : existingBill.mobile_number;
        const kmNum = km_driven !== undefined ? Number(km_driven) : existingBill.km_driven;
        const totalNum = total_amount !== undefined ? Number(total_amount) : existingBill.total_amount;
        const advanceNum = advance_amount !== undefined ? Number(advance_amount) : existingBill.advance_amount;
        const balanceNum = totalNum - advanceNum;
        await (0, database_1.dbRun)(`UPDATE bills SET vehicle_number = ?, vehicle_model = ?, customer_name = ?, mobile_number = ?, km_driven = ?, bill_date = ?, total_amount = ?, advance_amount = ?, balance_amount = ?, complaint = ? WHERE id = ?`, [
            cleanVehicle,
            cleanModel,
            cleanName,
            cleanMobile,
            kmNum,
            bill_date || existingBill.bill_date,
            totalNum,
            advanceNum,
            balanceNum,
            complaint !== undefined ? complaint : existingBill.complaint,
            id
        ]);
        if (items && Array.isArray(items)) {
            // Re-create items
            await (0, database_1.dbRun)('DELETE FROM bill_items WHERE bill_id = ?', [id]);
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const prodName = (item.product_name || '').trim().toUpperCase();
                const qty = Number(item.qty) || 1;
                const amount = Number(item.amount) || 0;
                if (prodName !== '' && amount >= 0) {
                    // Check Product Master
                    const existingProd = await (0, database_1.dbGet)('SELECT id FROM products WHERE name = ?', [prodName]);
                    if (!existingProd) {
                        const unitPrice = qty > 0 ? amount / qty : amount;
                        await (0, database_1.dbRun)('INSERT INTO products (name, stock_qty, selling_price) VALUES (?, ?, ?)', [prodName, 100, unitPrice]);
                    }
                    await (0, database_1.dbRun)('INSERT INTO bill_items (bill_id, s_no, product_name, qty, amount) VALUES (?, ?, ?, ?, ?)', [id, item.s_no || (i + 1), prodName, qty, amount]);
                }
            }
        }
        const updatedBill = await (0, database_1.dbGet)('SELECT * FROM bills WHERE id = ?', [id]);
        const updatedItems = await (0, database_1.dbAll)('SELECT * FROM bill_items WHERE bill_id = ? ORDER BY s_no ASC', [id]);
        res.json({ success: true, data: { ...updatedBill, items: updatedItems } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateBill = updateBill;
const deleteBill = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await (0, database_1.dbGet)('SELECT * FROM bills WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        await (0, database_1.dbRun)('DELETE FROM bill_items WHERE bill_id = ?', [id]);
        await (0, database_1.dbRun)('DELETE FROM bills WHERE id = ?', [id]);
        res.json({ success: true, message: 'Bill deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteBill = deleteBill;
const getDashboardStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const todayBills = await (0, database_1.dbAll)('SELECT * FROM bills WHERE bill_date = ?', [today]);
        const todayCount = todayBills.length;
        const todayRevenue = todayBills.reduce((acc, b) => acc + (b.total_amount || 0), 0);
        const custCountRow = await (0, database_1.dbGet)('SELECT COUNT(*) as count FROM customers');
        const prodCountRow = await (0, database_1.dbGet)('SELECT COUNT(*) as count FROM products');
        const recentBillsRows = await (0, database_1.dbAll)('SELECT * FROM bills WHERE bill_date = ? ORDER BY bill_no DESC', [today]);
        const recentBills = await Promise.all(recentBillsRows.map(async (b) => {
            const items = await (0, database_1.dbAll)('SELECT * FROM bill_items WHERE bill_id = ? ORDER BY s_no ASC', [b.id]);
            return { ...b, items };
        }));
        const todayExpenses = await expenseController_1.expenseService.getTodayExpenses(today);
        res.json({
            success: true,
            stats: {
                todayBillsCount: todayCount,
                todayRevenue: todayRevenue,
                todayExpenses: todayExpenses,
                totalCustomers: custCountRow ? custCountRow.count : 0,
                totalProducts: prodCountRow ? prodCountRow.count : 0,
                recentBills
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
const generatePdf = async (req, res) => {
    try {
        const { html } = req.body;
        if (!html) {
            return res.status(400).json({ success: false, message: 'HTML content is required' });
        }
        const browser = await puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
        });
        const page = await browser.newPage();
        // Set viewport to exact A4 size at standard 96 DPI (794px x 1123px)
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
        const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 8mm 10mm 8mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body { 
              margin: 0; 
              padding: 0; 
              background-color: white;
              width: 100%;
              height: 100%;
            }
            .invoice-document {
              margin: 0 auto !important;
              border: 2px solid #1a237e !important;
              box-shadow: none !important;
            }
            .font-text { font-family: 'Bookman Old Style', 'Bookman', 'URW Bookman L', 'Lora', Georgia, serif !important; }
            .font-numeric { font-family: 'Arial', sans-serif !important; }
            .bill-table-grid td, .bill-table-grid th {
              border-right: 1.5px solid #1a237e !important;
              border-bottom: 1px solid #1a237e !important;
              padding: 4px 6px !important;
            }
            .bill-table-grid tr td:last-child, .bill-table-grid tr th:last-child {
              border-right: none !important;
            }
          </style>
        </head>
        <body style="display: flex; justify-content: center; align-items: flex-start;">
          ${html}
        </body>
      </html>
    `;
        await page.setContent(fullHtml, { waitUntil: 'load' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            margin: {
                top: '10mm',
                right: '8mm',
                bottom: '10mm',
                left: '8mm'
            }
        });
        await browser.close();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
        res.send(Buffer.from(pdfBuffer));
    }
    catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate PDF' });
    }
};
exports.generatePdf = generatePdf;
