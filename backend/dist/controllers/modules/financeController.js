import { Invoice } from '../../models/Modules/Invoice.js';
import { Payment } from '../../models/Modules/Payment.js';
import { Expense } from '../../models/Modules/Expense.js';
import mongoose from 'mongoose';
export const getDashboardStats = async (req, res) => {
    try {
        const { companyId } = req.query;
        if (!companyId)
            return res.status(400).json({ message: 'Company ID required' });
        const companyObjectId = new mongoose.Types.ObjectId(companyId);
        // Total Invoiced
        const invoices = await Invoice.aggregate([
            { $match: { companyId: companyObjectId, isDeleted: false, status: { $nin: ['DRAFT', 'CANCELLED'] } } },
            { $group: { _id: null, total: { $sum: '$grandTotal' } } }
        ]);
        // Total Received
        const payments = await Payment.aggregate([
            { $match: { companyId: companyObjectId, isDeleted: false } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        // Total Expenses
        const expenses = await Expense.aggregate([
            { $match: { companyId: companyObjectId, isDeleted: false } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalSales = invoices.length > 0 ? invoices[0].total : 0;
        const totalReceived = payments.length > 0 ? payments[0].total : 0;
        const totalExpenses = expenses.length > 0 ? expenses[0].total : 0;
        const totalOutstanding = totalSales - totalReceived;
        res.status(200).json({
            totalSales,
            totalReceived,
            totalOutstanding,
            totalExpenses
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
