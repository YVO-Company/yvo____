import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Plan } from '../models/Global/Plan.js';
import { User } from '../models/Global/User.js';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '../.env' }); // Adjust path if running from backend/scripts

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/yvo';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

const seedPlans = async () => {
    const plans = [
        {
            code: 'BASIC',
            name: 'Basic Plan',
            priceMonthly: 0, // Free tier
            defaultLimits: {
                users: 2,
                storageGB: 1,
                aiCredits: 10,
                invoicesPerMonth: 50
            },
            defaultFlags: {
                'ai_features': false,
                'advanced_reporting': false
            }
        },
        {
            code: 'PRO',
            name: 'Pro Plan',
            priceMonthly: 29,
            defaultLimits: {
                users: 10,
                storageGB: 50,
                aiCredits: 500,
                invoicesPerMonth: 1000
            },
            defaultFlags: {
                'ai_features': true,
                'advanced_reporting': true
            }
        },
        {
            code: 'ENTERPRISE',
            name: 'Enterprise Plan',
            priceMonthly: 99,
            defaultLimits: {
                users: 9999,
                storageGB: 1000,
                aiCredits: 9999,
                invoicesPerMonth: 9999
            },
            defaultFlags: {
                'ai_features': true,
                'advanced_reporting': true,
                'sso': true
            }
        }
    ];

    for (const plan of plans) {
        await Plan.findOneAndUpdate({ code: plan.code }, plan, { upsert: true, new: true });
        console.log(`Plan ${plan.code} seeded.`);
    }
};

const seedSuperAdmin = async () => {
    const email = 'admin@yvo.com'; // Change this if needed
    const password = 'admin'; // Change this if needed

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
        console.log('Super Admin already exists.');
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = new User({
        email,
        passwordHash,
        fullName: 'Super Admin',
        isSuperAdmin: true
    });

    await admin.save();
    console.log(`Super Admin seeded. Email: ${email}, Password: ${password}`);
};

const run = async () => {
    try {
        await seedPlans();
        await seedSuperAdmin();
        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

run();
