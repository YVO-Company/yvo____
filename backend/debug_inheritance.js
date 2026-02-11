
import mongoose from 'mongoose';
import { Company } from './models/Global/Company.js';
import { Plan } from './models/Global/Plan.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/sass-db?replicaSet=rs0';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const companies = await Company.find({}).populate('planId');

        for (const c of companies) {
            console.log(`\nCompany: ${c.name} (${c._id})`);
            console.log(`Plan: ${c.planId?.name}`);
            console.log(`Company Overrides (featureFlags):`, c.featureFlags);

            if (c.planId && c.planId.defaultFlags) {
                console.log(`Plan Defaults:`, c.planId.defaultFlags);
            }
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
