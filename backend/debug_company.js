import mongoose from 'mongoose';
import { Company } from './models/Global/Company.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const debugCompany = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yvo');
        console.log("Connected to DB");

        const companies = await Company.find({});
        console.log("Found Companies:", companies.length);

        const output = companies.map(c => ({
            id: c._id,
            name: c.name
        }));

        console.log(JSON.stringify(output, null, 2));
        fs.writeFileSync('company_dump.txt', JSON.stringify(output, null, 2));

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugCompany();
