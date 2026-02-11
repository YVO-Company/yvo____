import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Plan } from './models/Global/Plan.js';
import { Company } from './models/Global/Company.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/yvo');
        console.log('Connected to DB');

        const plans = await Plan.find({ isArchived: false });

        for (const plan of plans) {
            console.log(`Processing Plan: ${plan.name}`);
            let modified = false;

            if (!plan.defaultFlags) plan.defaultFlags = new Map();
            if (!(plan.defaultFlags instanceof Map)) {
                plan.defaultFlags = new Map(Object.entries(plan.defaultFlags));
            }

            // Mapping Legacy -> New
            const mapping = {
                'finance': 'module_finance',
                'inventory': 'module_inventory',
                'employees': 'module_employees',
                'calendar': 'module_calendar',
                'invoicing': 'module_invoicing',
                'analytics': 'module_analytics'
            };

            for (const [legacy, current] of Object.entries(mapping)) {
                // If legacy is TRUE, ensure current is TRUE
                if (plan.defaultFlags.get(legacy) === true) {
                    if (!plan.defaultFlags.has(current) || plan.defaultFlags.get(current) !== true) {
                        console.log(`  - Migrating ${legacy} -> ${current}`);
                        plan.defaultFlags.set(current, true);
                        modified = true;
                    }
                }
            }

            // Explicitly ensure 'module_broadcasts' is enabled for PRO if not set (assuming PRO has everything)
            if (plan.code === 'PRO' || plan.code === 'PRO_PLAN' || plan.name.toLowerCase().includes('pro')) {
                if (!plan.defaultFlags.has('module_broadcasts')) {
                    console.log(`  - Enabling module_broadcasts for PRO`);
                    plan.defaultFlags.set('module_broadcasts', true);
                    modified = true;
                }
                if (!plan.defaultFlags.has('ai_enabled')) {
                    console.log(`  - Enabling ai_enabled for PRO`);
                    plan.defaultFlags.set('ai_enabled', true);
                    modified = true;
                }
            }

            if (modified) {
                plan.markModified('defaultFlags');
                await plan.save({ w: 'majority' });
                console.log(`  Saved updates for ${plan.name}`);

                // Also Sync Companies (Just in case)
                // We won't remove overrides here, just ensuring Plan is correct source of truth.
            } else {
                console.log(`  No changes needed.`);
            }
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
