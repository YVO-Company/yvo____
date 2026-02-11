import mongoose from 'mongoose';
import { User } from './models/Global/User.js';
import { Company } from './models/Global/Company.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const fixUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yvo');
        console.log("Connected to DB");

        const email = 'user@company.com';
        const companyId = '69873a5a1d893c740340fcba'; // From company_dump.txt

        // 1. Update User Membership explicitly
        const user = await User.findOneAndUpdate(
            { email },
            {
                memberships: [{
                    companyId: companyId,
                    role: 'OWNER'
                }]
            },
            { new: true }
        );

        console.log("Updated User Membership");

        // 2. Setup Verification
        const userPopulated = await User.findOne({ email }).populate('memberships.companyId');

        console.log("Populated User:", JSON.stringify(userPopulated, null, 2));

        if (userPopulated.memberships[0].companyId && userPopulated.memberships[0].companyId._id) {
            console.log("SUCCESS: Population worked!", userPopulated.memberships[0].companyId.name);
        } else {
            console.log("FAILURE: Population failed.", userPopulated.memberships);
        }

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

fixUser();
