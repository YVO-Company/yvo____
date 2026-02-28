import { Request, Response } from 'express';
import { Company } from '../../models/Global/Company.js';
import { User } from '../../models/Global/User.js';
// import { Payment } from '../../models/Global/Payment.js'; // Assuming payment model exists or will be used

// GET /sa/analytics/dashboard
export const getDashboardAnalytics = async (req: Request, res: Response) => {
    try {
        console.log('[Analytics] Fetching dashboard data...');
        const { year } = req.query;
        const targetYear = parseInt(year as string) || new Date().getFullYear();
        console.log(`[Analytics] Target Year: ${targetYear}`);

        // 1. Company Growth (Created per month)
        const startOfYear = new Date(targetYear, 0, 1);
        const endOfYear = new Date(targetYear + 1, 0, 1);

        const companies = await Company.find({
            createdAt: { $gte: startOfYear, $lt: endOfYear }
        });

        const monthlyGrowth = new Array(12).fill(0);
        companies.forEach(c => {
            const month = new Date(c.createdAt).getMonth();
            monthlyGrowth[month]++;
        });

        // 2. Expiry Forecast (Expiring per month in target year)
        // Find companies where subscriptionEndsAt is in this year
        const expiringCompanies = await Company.find({
            subscriptionEndsAt: { $gte: startOfYear, $lt: endOfYear }
        });

        const monthlyExpiry = new Array(12).fill(0);
        expiringCompanies.forEach(c => {
            if (c.subscriptionEndsAt) {
                const month = new Date(c.subscriptionEndsAt).getMonth();
                monthlyExpiry[month]++;
            }
        });

        // 3. Status Distribution (Snapshot)
        const statusDist = await Company.aggregate([
            { $group: { _id: '$subscriptionStatus', count: { $sum: 1 } } }
        ]);

        res.json({
            year: targetYear,
            growth: monthlyGrowth,
            expiry: monthlyExpiry,
            statusDistribution: statusDist.map(s => ({ name: s._id || 'Unknown', value: s.count })),
            totalCompanies: await Company.countDocuments(),
            activeCompanies: await Company.countDocuments({ subscriptionStatus: 'active' })
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// GET /sa/analytics/reports/expiry
export const getExpiryReport = async (req: Request, res: Response) => {
    try {
        const { days = 30 } = req.query; // Default next 30 days
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() + parseInt(days as string));

        const companies = await Company.find({
            subscriptionEndsAt: { $gte: new Date(), $lte: limitDate }
        }).populate('planId', 'name');

        const report = companies.map(c => ({
            name: c.name,
            email: c.email,
            plan: (c as any).planId?.name || 'N/A',
            status: c.subscriptionStatus,
            expiryDate: c.subscriptionEndsAt
        }));

        res.json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// GET /sa/analytics/reports/companies
export const getCompanyReport = async (req: Request, res: Response) => {
    try {
        // Full extract of company validity details
        const companies = await Company.find().populate('planId', 'name');

        const report = companies.map(c => ({
            name: c.name,
            owner: (c as any).userId, // Ideally populate owner Details
            plan: (c as any).planId?.name || 'N/A',
            status: c.subscriptionStatus,
            created: c.createdAt,
            expires: c.subscriptionEndsAt
        }));

        res.json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
