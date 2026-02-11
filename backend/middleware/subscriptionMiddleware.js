import { Company } from '../models/Global/Company.js';

export const checkSubscriptionStatus = async (req, res, next) => {
    try {
        // 1. Identify Company
        // Priority: Header > Body > Query
        const companyId = req.headers['x-company-id'] || req.body.companyId || req.query.companyId;

        if (!companyId) {
            // If we can't identify the company, we might default to allowing 
            // OR blocking. For safety in a multi-tenant app, usually block or pass if it's a global route.
            // But strict modules require company context.
            // Let's pass and let the specific controller handle "Missing Company ID" errors if needed.
            return next();
        }

        // 2. Fetch Company
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // 3. Check for "Overdue Grace Period" state
        // Status is 'active', but Date is in the past.
        const isOverdue = company.subscriptionStatus === 'active' &&
            company.subscriptionEndsAt &&
            new Date(company.subscriptionEndsAt) < new Date();

        // 4. Enforce Read-Only if Overdue
        if (isOverdue) {
            // Allow GET (Read) logic
            if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
                return next();
            }

            // Block Write logic (POST, PUT, PATCH, DELETE)
            return res.status(403).json({
                message: 'Subscription Overdue. Your account is in Read-Only mode. Please renew your subscription to make changes.',
                code: 'SUBSCRIPTION_OVERDUE'
            });
        }

        // 5. Also Block if "Expired" or "Suspended" (Double check)
        if (company.subscriptionStatus === 'expired' || company.subscriptionStatus === 'suspended') {
            // Maybe block EVERYTHING? Or just Writes?
            // User said "Active make it unactive" -> usually suspended means NO access.
            // But for this specific "Overdue" request, we focus on Read-Only.
            // Let's stick to the Overdue Read-Only logic requested.
            // If status is ALREADY 'expired', the Frontend likely locks them out anyway via config.
            // But for API safety, let's block writes here too.
            if (req.method !== 'GET') {
                return res.status(403).json({ message: 'Subscription Expired/Suspended. Action Denied.' });
            }
        }

        next();
    } catch (error) {
        console.error("Subscription Middleware Error:", error);
        res.status(500).json({ message: 'Internal Server Error during subscription check' });
    }
};
