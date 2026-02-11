
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Company } from './models/Global/Company.js';
import { Plan } from './models/Global/Plan.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/yvo';

// Helper to check deep equality or loose match
const areValuesEqual = (val1, val2) => {
    return val1 === val2; // capable of handling booleans
};

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log(`Connected to MongoDB (${MONGO_URI})`);
        console.log('Starting Cleanup...');

        const companies = await Company.find({}).populate('planId');
        let updatedCount = 0;

        for (const company of companies) {
            if (!company.planId) {
                console.log(`Skipping ${company.name} (No Plan)`);
                continue;
            }

            const plan = company.planId;
            const planDefaults = plan.defaultFlags ? Object.fromEntries(plan.defaultFlags) : {};

            // If company has no overrides, it's already pure inheritance
            if (!company.featureFlags || company.featureFlags.size === 0) {
                continue;
            }

            const companyFlags = company.featureFlags instanceof Map
                ? Object.fromEntries(company.featureFlags)
                : company.featureFlags;

            const cleanedFlags = {};
            let hasChanges = false;
            let removedKeys = [];

            // Identify overrides that are actually different from the plan
            for (const [key, value] of Object.entries(companyFlags)) {
                const planValue = planDefaults[key];

                // If the company value matches the plan value, it is REDUNDANT.
                // We should remove it so it falls back to inheritance.
                if (areValuesEqual(value, planValue)) {
                    hasChanges = true;
                    removedKeys.push(key);
                    // Do NOT add to cleanedFlags -> effectively removing it
                } else {
                    // It's a genuine override, keep it
                    cleanedFlags[key] = value;
                }
            }

            if (hasChanges) {
                console.log(`\nCleaning ${company.name}...`);
                console.log(`- Plan: ${plan.name}`);
                console.log(`- Removing Stale Overrides: ${removedKeys.join(', ')}`);
                console.log(`- Keeping Real Overrides: ${Object.keys(cleanedFlags).join(', ')}`);

                // Update the company
                company.featureFlags = new Map(Object.entries(cleanedFlags));
                company.markModified('featureFlags');
                await company.save();
                updatedCount++;
            }
        }

        console.log(`\nMigration Complete. Updated ${updatedCount} companies.`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
