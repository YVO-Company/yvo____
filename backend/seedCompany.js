import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './models/Global/User.js';
import { Company } from './models/Global/Company.js';
import { Plan } from './models/Global/Plan.js';

dotenv.config();

const seedCompany = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yvo');
        console.log('Connected to MongoDB');

        // 1. Ensure a Plan exists
        let plan = await Plan.findOne({ code: 'PRO' });
        if (!plan) {
            plan = await Plan.create({
                code: 'PRO',
                name: 'Pro Plan',
                priceMonthly: 50,
                defaultFlags: {
                    finance: true,
                    inventory: true,
                    employees: true,
                    calendar: true
                }
            });
            console.log('Created Pro Plan');
        }

        // 2. Check if Company User exists
        const email = 'user@company.com';
        const password = 'password123';

        let user = await User.findOne({ email });

        if (user) {
            console.log('Company User already exists.');
        } else {
            // Create Company
            const company = await Company.create({
                name: 'Demo Company',
                planId: plan._id,
                subscriptionStatus: 'active',
                featureFlags: {
                    finance: true,
                    inventory: true,
                    employees: true,
                    calendar: true
                },
                apiKey: `sk_demo_${Date.now()}`
            });

            // Create User
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            user = await User.create({
                fullName: 'Demo User',
                email,
                passwordHash,
                memberships: [{
                    companyId: company._id,
                    role: 'OWNER'
                }],
                isSuperAdmin: false
            });
            console.log('Created new Company and User');
        }

        console.log('-----------------------------------');
        console.log('COMPANY LOGIN CREDENTIALS:');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding company:', error);
        process.exit(1);
    }
};

seedCompany();
