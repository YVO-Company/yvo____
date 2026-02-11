import mongoose from 'mongoose';
import { Company } from './models/Global/Company.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yvo');
        console.log('Connected');

        const companies = await Company.find({});
        console.log(`Found ${companies.length} companies.`);
        companies.forEach(c => {
            console.log(`ID: ${c._id}, Name: ${c.name}, Email: ${c.email}`);
        });

    } catch (e) {
        console.error("Error Querying Companies:", e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
