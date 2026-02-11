import mongoose from 'mongoose';
import { LeaveRequest } from './models/Modules/LeaveRequest.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yvo');
        console.log('Connected');

        const leaves = await LeaveRequest.find({});
        console.log(`Found ${leaves.length} leaves.`);
        leaves.forEach(l => {
            console.log(`- ID: ${l._id}, Company: ${l.companyId}, Status: ${l.status}, Employee: ${l.employeeId}`);
        });

    } catch (e) {
        console.error("Error Querying LeaveRequest:", e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
