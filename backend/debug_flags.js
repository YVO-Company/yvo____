import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Company } from './models/Global/Company.js';
import { Plan } from './models/Global/Plan.js';
import { FeatureFlag } from './models/Global/FeatureFlag.js';
import { User } from './models/Global/User.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const company = await Company.findOne({ name: 'Demo Company' }).populate('planId');
        if (!company) {
            console.log('Company not found');
            process.exit(1);
        }

        console.log('Company:', company.name, company._id);

        const demoUser = await User.findOne({ email: 'user@company.com' }).populate('memberships.companyId');
        if (!demoUser) {
            console.log('User not found');
        } else {
            console.log('User ID:', demoUser._id);
            console.log('isSuperAdmin:', demoUser.isSuperAdmin);
            console.log('Memberships Count:', demoUser.memberships.length);
            // console.log('User Memberships:', JSON.stringify(demoUser.memberships, null, 2));

            if (demoUser.memberships.length > 0) {
                const membership = demoUser.memberships[0];
                console.log('First Membership Role:', membership.role);
                console.log('First Membership Company ID (in ref):', membership.companyId?._id);
                console.log('First Membership Company Name:', membership.companyId?.name);
            } else {
                console.log('No memberships found!');
            }
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
run();
