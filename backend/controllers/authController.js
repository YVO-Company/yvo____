import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/Global/User.js';
import { Company } from '../models/Global/Company.js';
import { Plan } from '../models/Global/Plan.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', {
        expiresIn: '30d',
    });
};

// POST /auth/register-company
export const registerCompany = async (req, res) => {
    try {
        const { companyName, ownerName, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 1. Get Default Plan (Basic)
        let plan = await Plan.findOne({ code: 'BASIC' });
        if (!plan) {
            // Create fallback plan if not seeding
            plan = await Plan.create({
                code: 'BASIC',
                name: 'Basic',
                priceMonthly: 0
            });
        }

        // 2. Create Company
        // Generate a random API key for the company (simple implementation)
        const apiKey = `sk_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        const company = await Company.create({
            name: companyName,
            planId: plan._id,
            subscriptionStatus: 'trial',
            featureFlags: plan.defaultFlags,
            apiKey
        });

        // 3. Create Owner
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            fullName: ownerName,
            email,
            passwordHash,
            memberships: [{
                companyId: company._id,
                role: 'OWNER'
            }],
            isSuperAdmin: false
        });

        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            token: generateToken(user._id),
            companyId: company._id
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('memberships.companyId');

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            // Update last login
            user.lastLoginAt = Date.now();
            await user.save();

            // Determine default company context (first membership)
            const primaryCompany = user.memberships.length > 0 ? user.memberships[0].companyId : null;

            console.log("Login User:", user.email, "Primary Company:", primaryCompany);

            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                isSuperAdmin: user.isSuperAdmin,
                memberships: user.memberships,
                currentCompanyId: primaryCompany?._id, // Client can switch if multiple
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
