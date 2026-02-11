import mongoose from 'mongoose';
import { Employee } from './models/Modules/Employee.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yvo');
        console.log('Connected');

        const employees = await Employee.find({});
        console.log(`Total Employees: ${employees.length}`);

        if (employees.length > 0) {
            console.log('Sample Employee CompanyID:', employees[0].companyId);
            employees.forEach(e => {
                console.log(`${e.firstName}: ${e.companyId}`);
            });
        }

        // List all companies
        const companies = await mongoose.connection.db.collection('companies').find({}).toArray();
        console.log('Companies found:', companies.map(c => ({ id: c._id, name: c.name })));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
