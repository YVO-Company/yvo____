import mongoose from 'mongoose';
import { LeaveRequest } from './models/Modules/LeaveRequest.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yvo');
        console.log('Connected');

        const leaves = await LeaveRequest.find({});
        for (const l of leaves) {
            console.log(`Original Status: '${l.status}'`);
            l.status = 'Pending';
            await l.save();
            console.log(`Updated leave ${l._id} to Pending`);
        }
        console.log('Done.');

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
