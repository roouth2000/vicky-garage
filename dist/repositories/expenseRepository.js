"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteExpenseRepository = void 0;
const database_1 = require("../db/database");
class SqliteExpenseRepository {
    async create(expense) {
        const res = await (0, database_1.dbRun)('INSERT INTO expenses (remarks, amount, date) VALUES (?, ?, ?)', [expense.remarks, expense.amount, expense.date]);
        const id = res.lastID;
        const created = await this.findById(id);
        if (!created)
            throw new Error('Failed to retrieve created expense');
        return created;
    }
    async update(id, expense) {
        const fields = [];
        const params = [];
        if (expense.remarks !== undefined) {
            fields.push('remarks = ?');
            params.push(expense.remarks);
        }
        if (expense.amount !== undefined) {
            fields.push('amount = ?');
            params.push(expense.amount);
        }
        if (expense.date !== undefined) {
            fields.push('date = ?');
            params.push(expense.date);
        }
        if (fields.length === 0)
            return false;
        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);
        const res = await (0, database_1.dbRun)(`UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`, params);
        return res.changes > 0;
    }
    async delete(id) {
        const res = await (0, database_1.dbRun)('DELETE FROM expenses WHERE id = ?', [id]);
        return res.changes > 0;
    }
    async findById(id) {
        const row = await (0, database_1.dbGet)('SELECT * FROM expenses WHERE id = ?', [id]);
        return row || null;
    }
    async findAll(filters) {
        let sql = 'SELECT * FROM expenses WHERE 1=1';
        const params = [];
        if (filters.search) {
            sql += ' AND (remarks LIKE ? OR CAST(amount AS TEXT) LIKE ?)';
            const term = `%${filters.search}%`;
            params.push(term, term);
        }
        if (filters.startDate) {
            sql += ' AND date >= ?';
            params.push(filters.startDate);
        }
        if (filters.endDate) {
            sql += ' AND date <= ?';
            params.push(filters.endDate);
        }
        sql += ' ORDER BY date DESC, id DESC';
        return await (0, database_1.dbAll)(sql, params);
    }
    async getTodayTotal(dateStr) {
        const row = await (0, database_1.dbGet)('SELECT SUM(amount) as total FROM expenses WHERE date = ?', [dateStr]);
        return row && row.total ? row.total : 0;
    }
    async getDateRangeSummary(startDate, endDate) {
        const row = await (0, database_1.dbGet)('SELECT SUM(amount) as total, COUNT(*) as count FROM expenses WHERE date >= ? AND date <= ?', [startDate, endDate]);
        return {
            totalAmount: row && row.total ? row.total : 0,
            count: row && row.count ? row.count : 0
        };
    }
}
exports.SqliteExpenseRepository = SqliteExpenseRepository;
