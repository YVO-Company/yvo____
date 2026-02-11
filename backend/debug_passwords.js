import mongoose from 'mongoose';
import { Employee } from './models/Modules/Employee.js'; // Adjust path
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yvo');
        console.log('Connected');

        const employees = await Employee.find({});
        console.log(`Found ${employees.length} employees.`);

        employees.forEach(emp => {
            console.log(`Name: ${emp.firstName} ${emp.lastName}`);
            console.log(`Phone: ${emp.phone}`);
            console.log(`Password (Hash/Plain): ${emp.password}`);
            console.log('---');
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
