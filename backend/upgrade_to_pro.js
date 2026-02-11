import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Company } from './models/Global/Company.js';
import { Plan } from './models/Global/Plan.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Ensure PRO Plan has ALL flags
        let plan = await Plan.findOne({ code: 'PRO' });
        if (!plan) {
            plan = await Plan.create({
                code: 'PRO',
                name: 'Pro Plan',
                priceMonthly: 50,
                defaultFlags: {}
            });
            console.log('Created PRO plan');
        }

        // Force update flags
        plan.defaultFlags = {
            finance: true,
            inventory: true,
            employees: true,
            calendar: true,
            analytics: true,
            invoicing: true // Adding explicitly just in case
        };
        await plan.save();
        console.log('Updated PRO Plan flags');

        // 2. Update Company to use PRO Plan
        const company = await Company.findOne({ name: 'Demo Company' });
        if (!company) {
            console.log('Company not found');
            process.exit(1);
        }

        company.planId = plan._id;
        company.subscriptionStatus = 'active';

        // Also force override flags on company level to be safe
        company.featureFlags = {
            finance: true,
            inventory: true,
            employees: true,
            calendar: true,
            analytics: true,
            invoicing: true
        };

        await company.save();
        console.log(`Updated Company '${company.name}' to PRO Plan with all features.`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
run();
