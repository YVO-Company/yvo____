import mongoose from 'mongoose';
import { Employee } from './models/Modules/Employee.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yvo');
        console.log('Connected to DB');

        const employees = await Employee.find({});
        console.log(`Found ${employees.length} employees checking for plain text passwords...`);

        for (const emp of employees) {
            // Check if password looks like a bcrypt hash
            if (!emp.password.startsWith('$2b$') && !emp.password.startsWith('$2a$')) {
                console.log(`Hashing password for: ${emp.firstName} ${emp.lastName} (${emp.phone})`);
                const hashedPassword = await bcrypt.hash(emp.password, 10);
                emp.password = hashedPassword;
                await emp.save();
                console.log('  -> Fixed.');
            } else {
                console.log(`Skipping (already hashed): ${emp.firstName} ${emp.lastName}`);
            }
        }

        console.log('Done scanning passwords.');

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
