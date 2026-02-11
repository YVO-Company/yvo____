
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Company } from './models/Global/Company.js';
import { Plan } from './models/Global/Plan.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/yvo';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log(`Connected to MongoDB`);

        // 1. Find a Test Plan (Pro)
        const plan = await Plan.findOne({ code: 'PRO_PLAN' }) || await Plan.findOne({ name: 'Pro Plan' });
        if (!plan) {
            console.error('Pro Plan not found');
            process.exit(1);
        }
        console.log(`\nTesting with Plan: ${plan.name} (${plan._id})`);

        // 2. Find a Company on this Plan
        const company = await Company.findOne({ planId: plan._id });
        if (!company) {
            console.error('No company found on this plan');
            process.exit(1);
        }
        console.log(`Testing with Company: ${company.name} (${company._id})`);

        // 3. Clear Company Overrides for a specific key to ensure inheritance
        const TEST_KEY = 'module_broadcasts';
        if (company.featureFlags && company.featureFlags.get(TEST_KEY) !== undefined) {
            console.log(`Clearing override for ${TEST_KEY} on company...`);
            company.featureFlags.delete(TEST_KEY);
            company.markModified('featureFlags');
            await company.save();
        }

        // 4. Toggle Plan Flag
        const originalValue = plan.defaultFlags ? plan.defaultFlags.get(TEST_KEY) : false;
        const newValue = !originalValue;

        console.log(`\nToggling Plan ${TEST_KEY}: ${originalValue} -> ${newValue}`);

        if (!plan.defaultFlags) plan.defaultFlags = new Map();
        plan.defaultFlags.set(TEST_KEY, newValue);
        plan.markModified('defaultFlags');
        await plan.save();

        // 5. Verify Inheritance
        // re-fetch company to simulate fresh request
        const freshCompany = await Company.findById(company._id).populate('planId');

        // Emulate configController logic
        const planDefaults = freshCompany.planId.defaultFlags ? Object.fromEntries(freshCompany.planId.defaultFlags) : {};
        const companyOverrides = freshCompany.featureFlags ? Object.fromEntries(freshCompany.featureFlags) : {};

        const effectiveFlags = {
            ...planDefaults,
            ...companyOverrides
        };

        const inheritedValue = effectiveFlags[TEST_KEY];
        console.log(`\nCompany Effective ${TEST_KEY}: ${inheritedValue}`);

        if (inheritedValue === newValue) {
            console.log('SUCCESS: Company inherited the plan change.');
        } else {
            console.error('FAILURE: Company did NOT inherit the plan change.');
            console.log('Plan Defaults:', planDefaults);
            console.log('Company Overrides:', companyOverrides);
        }

        // Cleanup: Revert plan
        plan.defaultFlags.set(TEST_KEY, originalValue);
        plan.markModified('defaultFlags');
        await plan.save();
        console.log('\nReverted plan changes.');

        process.exit(0);

    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
