import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Company } from './models/Global/Company.js';
import { Plan } from './models/Global/Plan.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/yvo');
        console.log('Connected to DB');

        const plans = await Plan.find({ isArchived: false });
        console.log(`\n--- PLANS (${plans.length}) ---`);
        for (const p of plans) {
            console.log(`Plan: ${p.name} (${p.code})`);
            const flags = p.defaultFlags instanceof Map ? Object.fromEntries(p.defaultFlags) : p.defaultFlags;
            // Filter only relevant flags to keep output clean
            const relevantFlags = {};
            for (const k in flags) {
                if (flags[k] === true) relevantFlags[k] = true;
            }
            console.log(`  Enabled Flags:`, Object.keys(relevantFlags).length > 0 ? relevantFlags : 'NONE');
        }

        const companies = await Company.find().populate('planId');
        console.log(`\n--- COMPANIES (${companies.length}) ---`);
        for (const c of companies) {
            console.log(`Company: ${c.name} (Plan: ${c.planId?.name})`);
            // Check overrides
            const overrides = c.featureFlags instanceof Map ? Object.fromEntries(c.featureFlags) : c.featureFlags;
            const relevantOverrides = {};
            for (const k in overrides) {
                if (overrides[k] === true) relevantOverrides[k] = true;
            }
            console.log(`  Enabled Overrides:`, Object.keys(relevantOverrides).length > 0 ? relevantOverrides : 'NONE');

            // Calculate Effective
            const planFlags = c.planId?.defaultFlags instanceof Map ? Object.fromEntries(c.planId.defaultFlags) : (c.planId?.defaultFlags || {});
            const effective = { ...planFlags, ...overrides };
            const relevantEffective = {};
            for (const k in effective) {
                if (effective[k] === true) relevantEffective[k] = true;
            }
            console.log(`  EFFECTIVE Enabled:`, Object.keys(relevantEffective).length > 0 ? Object.keys(relevantEffective) : 'NONE');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
