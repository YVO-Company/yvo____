import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Company } from '../models/Global/Company.js';
dotenv.config();
const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/yvo');
        const companies = await Company.find({});
        console.log(`\nFound ${companies.length} companies:\n`);
        companies.forEach(c => {
            console.log(`Name: ${c.name}`);
            console.log(`ID: ${c._id}`);
            console.log(`Status: "${c.subscriptionStatus}"`);
            console.log(`Plan: ${c.planId}`);
            console.log(`Sub Ends: ${c.subscriptionEndsAt}`);
            console.log('------------------------');
        });
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await mongoose.disconnect();
    }
};
run();
