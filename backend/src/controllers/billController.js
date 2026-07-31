"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateBill = exports.getNextBillNo = exports.getDashboardStats = exports.getBills = exports.getBillById = exports.generatePdf = exports.deleteBill = exports.createBill = void 0;
var _express = require("express");
var _models = require("../models");
var _database = require("../db/database");
var _expenseController = require("./expenseController");
var _puppeteer = _interopRequireDefault(require("puppeteer"));
var _sequelize = require("sequelize");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const getNextBillNo = async (req, res) => {
  try {
    const maxBillNo = await _models.Bill.max('bill_no');
    const nextBillNo = (maxBillNo || 0) + 1;
    res.json({
      success: true,
      nextBillNo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getNextBillNo = getNextBillNo;
const getBills = async (req, res) => {
  try {
    const search = req.query.search || '';
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';
    let whereClause = {};
    if (search) {
      const parsedNum = parseInt(search, 10);
      const orConditions = [{
        vehicle_number: {
          [_sequelize.Op.like]: `%${search}%`
        }
      }, {
        customer_name: {
          [_sequelize.Op.like]: `%${search}%`
        }
      }, {
        mobile_number: {
          [_sequelize.Op.like]: `%${search}%`
        }
      }];
      if (!isNaN(parsedNum)) {
        orConditions.push({
          bill_no: parsedNum
        });
      }
      whereClause[_sequelize.Op.or] = orConditions;
    }
    if (startDate) {
      whereClause.bill_date = {
        ...whereClause.bill_date,
        [_sequelize.Op.gte]: startDate
      };
    }
    if (endDate) {
      whereClause.bill_date = {
        ...whereClause.bill_date,
        [_sequelize.Op.lte]: endDate
      };
    }
    const bills = await _models.Bill.findAll({
      where: whereClause,
      order: [['bill_no', 'DESC']]
    });
    res.json({
      success: true,
      data: bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getBills = getBills;
const getBillById = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const bill = await _models.Bill.findByPk(id, {
      include: [{
        model: _models.BillItem,
        as: 'items'
      }],
      order: [[{
        model: _models.BillItem,
        as: 'items'
      }, 's_no', 'ASC']]
    });
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getBillById = getBillById;
const createBill = async (req, res) => {
  const transaction = await _database.sequelize.transaction();
  try {
    const {
      bill_no,
      vehicle_number,
      vehicle_model,
      customer_name,
      mobile_number,
      km_driven,
      bill_date,
      total_amount,
      advance_amount,
      complaint,
      items
    } = req.body;
    if (!vehicle_number || !bill_date || !items || !Array.isArray(items)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vehicle number, date, and items are required'
      });
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
    const existingCust = await _models.Customer.findOne({
      where: {
        vehicle_number: cleanVehicle
      },
      transaction
    });
    if (existingCust) {
      customerId = existingCust.id;
      existingCust.vehicle_model = cleanModel || existingCust.vehicle_model;
      existingCust.customer_name = cleanName;
      existingCust.mobile_number = cleanMobile;
      existingCust.km_driven = kmNum;
      await existingCust.save({
        transaction
      });
    } else {
      const newCust = await _models.Customer.create({
        vehicle_number: cleanVehicle,
        vehicle_model: cleanModel || '',
        km_driven: kmNum,
        customer_name: cleanName,
        mobile_number: cleanMobile
      }, {
        transaction
      });
      customerId = newCust.id;
    }

    // Determine bill number
    let finalBillNo = bill_no;
    if (!finalBillNo) {
      const maxBillNo = await _models.Bill.max('bill_no', {
        transaction
      });
      finalBillNo = (maxBillNo || 0) + 1;
    }

    // 2. Insert Bill
    const bill = await _models.Bill.create({
      bill_no: finalBillNo,
      customer_id: customerId,
      vehicle_number: cleanVehicle,
      vehicle_model: cleanModel,
      customer_name: cleanName,
      mobile_number: cleanMobile,
      km_driven: kmNum,
      bill_date: bill_date,
      total_amount: totalNum,
      advance_amount: advanceNum,
      balance_amount: balanceNum,
      complaint: complaint || ''
    }, {
      transaction
    });

    // 3. Process items & Auto-create Products into Product Master
    const billItemsData = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const prodName = (item.product_name || '').trim().toUpperCase();
      const qty = Number(item.qty) || 1;
      const amount = Number(item.amount) || 0;
      if (prodName !== '' && amount >= 0) {
        // Check Product Master auto-update/create
        const existingProd = await _models.Product.findOne({
          where: {
            name: prodName
          },
          transaction
        });
        if (!existingProd) {
          const unitPrice = qty > 0 ? amount / qty : amount;
          await _models.Product.create({
            name: prodName,
            stock_qty: 100,
            selling_price: unitPrice
          }, {
            transaction
          });
        }
        billItemsData.push({
          bill_id: bill.id,
          s_no: item.s_no || i + 1,
          product_name: prodName,
          qty: qty,
          amount: amount
        });
      }
    }
    await _models.BillItem.bulkCreate(billItemsData, {
      transaction
    });
    await transaction.commit();

    // Fetch newly created with items
    const createdBill = await _models.Bill.findByPk(bill.id, {
      include: [{
        model: _models.BillItem,
        as: 'items'
      }],
      order: [[{
        model: _models.BillItem,
        as: 'items'
      }, 's_no', 'ASC']]
    });
    res.status(201).json({
      success: true,
      data: createdBill
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.createBill = createBill;
const updateBill = async (req, res) => {
  const transaction = await _database.sequelize.transaction();
  try {
    const {
      id
    } = req.params;
    const {
      vehicle_number,
      vehicle_model,
      customer_name,
      mobile_number,
      km_driven,
      bill_date,
      total_amount,
      advance_amount,
      complaint,
      items
    } = req.body;
    const existingBill = await _models.Bill.findByPk(id, {
      transaction
    });
    if (!existingBill) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    const cleanVehicle = vehicle_number ? vehicle_number.trim().toUpperCase() : existingBill.vehicle_number;
    const cleanModel = vehicle_model !== undefined ? vehicle_model.trim() : existingBill.vehicle_model;
    const cleanName = customer_name !== undefined ? customer_name.trim() : existingBill.customer_name;
    const cleanMobile = mobile_number !== undefined ? mobile_number.trim() : existingBill.mobile_number;
    const kmNum = km_driven !== undefined ? Number(km_driven) : existingBill.km_driven;
    const totalNum = total_amount !== undefined ? Number(total_amount) : existingBill.total_amount;
    const advanceNum = advance_amount !== undefined ? Number(advance_amount) : existingBill.advance_amount;
    const balanceNum = totalNum - advanceNum;
    existingBill.vehicle_number = cleanVehicle;
    existingBill.vehicle_model = cleanModel;
    existingBill.customer_name = cleanName;
    existingBill.mobile_number = cleanMobile;
    existingBill.km_driven = kmNum;
    if (bill_date) existingBill.bill_date = bill_date;
    existingBill.total_amount = totalNum;
    existingBill.advance_amount = advanceNum;
    existingBill.balance_amount = balanceNum;
    if (complaint !== undefined) existingBill.complaint = complaint;
    await existingBill.save({
      transaction
    });
    if (items && Array.isArray(items)) {
      await _models.BillItem.destroy({
        where: {
          bill_id: id
        },
        transaction
      });
      const billItemsData = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const prodName = (item.product_name || '').trim().toUpperCase();
        const qty = Number(item.qty) || 1;
        const amount = Number(item.amount) || 0;
        if (prodName !== '' && amount >= 0) {
          const existingProd = await _models.Product.findOne({
            where: {
              name: prodName
            },
            transaction
          });
          if (!existingProd) {
            const unitPrice = qty > 0 ? amount / qty : amount;
            await _models.Product.create({
              name: prodName,
              stock_qty: 100,
              selling_price: unitPrice
            }, {
              transaction
            });
          }
          billItemsData.push({
            bill_id: id,
            s_no: item.s_no || i + 1,
            product_name: prodName,
            qty: qty,
            amount: amount
          });
        }
      }
      await _models.BillItem.bulkCreate(billItemsData, {
        transaction
      });
    }
    await transaction.commit();
    const updatedBill = await _models.Bill.findByPk(id, {
      include: [{
        model: _models.BillItem,
        as: 'items'
      }],
      order: [[{
        model: _models.BillItem,
        as: 'items'
      }, 's_no', 'ASC']]
    });
    res.json({
      success: true,
      data: updatedBill
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.updateBill = updateBill;
const deleteBill = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const existing = await _models.Bill.findByPk(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Since onDelete: CASCADE is set, destroying the Bill will destroy the items too.
    await existing.destroy();
    res.json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.deleteBill = deleteBill;
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayBills = await _models.Bill.findAll({
      where: {
        bill_date: today
      }
    });
    const todayCount = todayBills.length;
    const todayRevenue = todayBills.reduce((acc, b) => acc + (b.total_amount || 0), 0);
    const totalCustomers = await _models.Customer.count();
    const totalProducts = await _models.Product.count();
    const recentBills = await _models.Bill.findAll({
      where: {
        bill_date: today
      },
      order: [['bill_no', 'DESC']],
      include: [{
        model: _models.BillItem,
        as: 'items'
      }]
    });
    const todayExpenses = await _expenseController.expenseService.getTodayExpenses(today);
    res.json({
      success: true,
      stats: {
        todayBillsCount: todayCount,
        todayRevenue: todayRevenue,
        todayExpenses: todayExpenses,
        totalCustomers,
        totalProducts,
        recentBills
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getDashboardStats = getDashboardStats;
const generatePdf = async (req, res) => {
  try {
    const {
      html
    } = req.body;
    if (!html) {
      return res.status(400).json({
        success: false,
        message: 'HTML content is required'
      });
    }
    const browser = await _puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2
    });
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
    await page.setContent(fullHtml, {
      waitUntil: 'load'
    });
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
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF'
    });
  }
};
exports.generatePdf = generatePdf;