import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Company } from './models/Global/Company.js';

dotenv.config();

const checkPass = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const companies = await Company.find({});
        console.log(`Found ${companies.length} companies.`);

        companies.forEach(c => {
            console.log(`Company: ${c.name} | Password: '${c.invoiceEditPassword}'`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkPass();
