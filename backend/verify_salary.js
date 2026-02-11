import mongoose from 'mongoose';
import { SalaryRecord } from './models/Modules/SalaryRecord.js'; // Adjust path
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yvo');
        console.log('Connected');

        const records = await SalaryRecord.find({}).limit(5);
        console.log('Records found:', records.length);
        if (records.length > 0) {
            console.log('Sample Record:', JSON.stringify(records[0], null, 2));
        } else {
            console.log('No records found. Creating one...');
            // Create a dummy record if needed for testing, but mostly we want to see if read works
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
