import { Company } from '../../models/Global/Company.js';
import { User } from '../../models/Global/User.js';
import { Plan } from '../../models/Global/Plan.js';
import bcrypt from 'bcryptjs';

// GET /sa/dashboard-stats
export const getDashboardStats = async (req, res) => {
    try {
        const totalCompanies = await Company.countDocuments({});
        const activeCompanies = await Company.countDocuments({ subscriptionStatus: 'active' });
        // Count users who are not super admins (Employees/Admins of companies)
        const totalUsers = await User.countDocuments({ isSuperAdmin: false });

        // Plan Distribution
        const companiesByPlan = await Company.aggregate([
            {
                $lookup: {
                    from: 'plans',
                    localField: 'planId',
                    foreignField: '_id',
                    as: 'plan'
                }
            },
            { $unwind: '$plan' },
            {
                $group: {
                    _id: '$plan.name',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentCompanies = await Company.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('planId', 'name');

        res.json({
            totalCompanies,
            activeCompanies,
            totalUsers,
            planDistribution: companiesByPlan.map(p => ({ name: p._id, value: p.count })),
            recentCompanies
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /sa/companies
export const getCompanies = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;

        const query = {};
        if (status) query.subscriptionStatus = status;
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const companies = await Company.find(query)
            .populate('planId', 'name code')
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await Company.countDocuments(query);

        res.json({
            companies,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /sa/companies/:id
export const getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id).populate('planId');
        if (!company) return res.status(404).json({ message: 'Company not found' });

        // Also fetch owners/admins for this company
        const admins = await User.find({
            'memberships': {
                $elemMatch: { companyId: company._id, role: { $in: ['OWNER', 'ADMIN'] } }
            }
        }).select('fullName email');

        res.json({ company, admins });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /sa/companies (Manual Create)
export const createCompany = async (req, res) => {
    try {
        const {
            name, planId,
            ownerName, ownerEmail, password,
            phone, address, website, businessType
        } = req.body;

        console.log('[CreateCompany] Payload:', { name, planId, ownerEmail, hasPassword: !!password });

        // Basic Validation
        if (!name || !planId || !ownerEmail || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 1. Get Plan
        const plan = await Plan.findById(planId);
        if (!plan) return res.status(400).json({ message: 'Invalid Plan ID' });

        // 2. Check if User/Company Exists
        const existingUser = await User.findOne({ email: ownerEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // 3. Create Company
        const company = new Company({
            name,
            planId: plan._id,
            subscriptionStatus: 'active',
            // Apply plan defaults
            featureFlags: plan.defaultFlags,
            limitOverrides: {},
            // Extended Details
            phone,
            address,
            website,
            businessType,
            email: ownerEmail // Main contact email for company
        });
        await company.save();

        // 4. Create Owner (User)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = new User({
            email: ownerEmail,
            fullName: ownerName,
            passwordHash,
            memberships: [{
                companyId: company._id,
                role: 'OWNER'
            }],
            isSuperAdmin: false
        });

        await user.save();

        res.status(201).json({ company, user });
    } catch (error) {
        console.error("Create Company Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// PATCH /sa/companies/:id/status
export const updateCompanyStatus = async (req, res) => {
    try {
        const { status, subscriptionEndsAt } = req.body;

        const updateData = { subscriptionStatus: status };
        if (subscriptionEndsAt) {
            updateData.subscriptionEndsAt = subscriptionEndsAt;
        }

        const company = await Company.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('planId');
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /sa/companies/:id/plan
export const updateCompanyPlan = async (req, res) => {
    try {
        const { planId } = req.body;

        // Validate Plan
        const plan = await Plan.findById(planId);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const company = await Company.findByIdAndUpdate(
            req.params.id,
            { planId: plan._id },
            { new: true }
        ).populate('planId');

        res.json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /sa/companies/:id/flags
// PATCH /sa/companies/:id/flags
export const updateCompanyFlags = async (req, res) => {
    try {
        const { flags } = req.body;
        console.log(`[SuperAdmin] Updating flags for company ${req.params.id}:`, flags);

        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ message: 'Company not found' });

        if (!company.featureFlags) {
            company.featureFlags = new Map();
        }

        // Mongoose Map Handling
        if (req.body.replace) {
            // Complete replacement (for Reset or clean save)
            console.log(`[SuperAdmin] Replacing flags for company ${req.params.id}`);
            company.featureFlags = new Map(Object.entries(flags || {}));
        } else {
            // MERGE (Legacy/Partial update)
            if (company.featureFlags instanceof Map) {
                for (const [key, value] of Object.entries(flags || {})) {
                    company.featureFlags.set(key, value);
                }
            } else {
                company.featureFlags = { ...company.featureFlags, ...(flags || {}) };
            }
        }

        // Crucial for Map/Mixed types changes to be detected
        company.markModified('featureFlags');

        await company.save();
        res.json(company);
    } catch (error) {
        console.error("[SuperAdmin] Update Flags Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// DELETE /sa/companies/:id
export const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ message: 'Company not found' });

        // 1. Remove Company Memberships from Users
        // Find users who are members of this company
        const members = await User.find({ 'memberships.companyId': company._id });

        for (const member of members) {
            // Filter out this company's membership
            member.memberships = member.memberships.filter(m => m.companyId.toString() !== company._id.toString());

            // If user has no more memberships, delete the user (Clean up)
            if (member.memberships.length === 0) {
                await User.findByIdAndDelete(member._id);
            } else {
                await member.save();
            }
        }

        // 2. Delete the Company
        await Company.findByIdAndDelete(req.params.id);

        res.json({ message: 'Company and associated data deleted successfully' });
    } catch (error) {
        console.error("Delete Company Error:", error);
        res.status(500).json({ message: error.message });
    }
};
