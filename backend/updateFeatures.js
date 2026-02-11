import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/Global/User.js';
import { Company } from './models/Global/Company.js';

dotenv.config();

const updateFeatures = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yvo');
        console.log('Connected to MongoDB');

        const email = 'user@company.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.error('User not found:', email);
            process.exit(1);
        }

        const companyId = user.memberships[0].companyId;
        console.log('Found Company ID:', companyId);

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            {
                $set: {
                    featureFlags: {
                        finance: true,
                        inventory: true,
                        employees: true,
                        calendar: true,
                        analytics: true,
                        invoices: true,
                        crm: true
                    }
                }
            },
            { new: true }
        );

        console.log('Updated Company Features:', updatedCompany.featureFlags);
        console.log('Success! All features enabled.');

        process.exit(0);
    } catch (error) {
        console.error('Error updating features:', error);
        process.exit(1);
    }
};

updateFeatures();
