import { Employee } from '../../models/Modules/Employee.js';
import { InventoryItem } from '../../models/Modules/InventoryItem.js';
import { Expense } from '../../models/Modules/Expense.js';
// import { Invoice } from '../../models/Modules/Invoice.js'; // Assuming Invoice model exists

export const getDashboardStats = async (req, res) => {
    try {
        const { companyId } = req.query;
        if (!companyId) return res.status(400).json({ message: 'Company ID is required' });

        const [
            employeeCount,
            inventoryCount,
            lowStockCount,
            totalExpenses,
            // invoiceStats
        ] = await Promise.all([
            Employee.countDocuments({ companyId, isDeleted: false }),
            InventoryItem.countDocuments({ companyId, isDeleted: false }),
            InventoryItem.countDocuments({ companyId, isDeleted: false, $expr: { $lte: ["$quantityOnHand", "$reorderLevel"] } }),
            Expense.aggregate([
                { $match: { companyId: new (await import('mongoose')).default.Types.ObjectId(companyId), isDeleted: false } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            // Invoice.aggregate(...)
        ]);

        res.status(200).json({
            employees: { total: employeeCount },
            inventory: { totalItems: inventoryCount, lowStock: lowStockCount },
            finance: {
                totalExpenses: totalExpenses[0]?.total || 0,
                // totalRevenue: invoiceStats...
            },
            performance: {
                monthlyGrowth: 12.5, // Mock data for now
                customerSatisfaction: 9.2
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
