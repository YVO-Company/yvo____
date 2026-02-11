import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Employee } from '../models/Modules/Employee.js';
import { CalendarEvent } from '../models/Modules/CalendarEvent.js';
import { Expense } from '../models/Modules/Expense.js';

// Load .env from backend root
dotenv.config({ path: '../.env' });

const runVerification = async () => {
    try {
        console.log('Connecting to MongoDB...');
        // Use connection string from env or default
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/yvo';
        console.log(`Using URI: ${mongoUri}`);

        await mongoose.connect(mongoUri);
        console.log('Connected to DB.');

        // 1. Create a Mock Company ID
        const companyId = new mongoose.Types.ObjectId();
        console.log(`Using Mock CompanyID: ${companyId}`);

        // 2. Test Employee Module
        console.log('\n--- Testing Employee Module ---');
        const employee = new Employee({
            companyId,
            firstName: 'Test',
            lastName: 'User',
            email: `test.${Date.now()}@example.com`,
            position: 'Developer',
            salary: 50000
        });
        await employee.save();
        console.log('Verified: Employee Created', employee._id);

        const fetchedEmp = await Employee.findById(employee._id);
        if (!fetchedEmp) throw new Error('Failed to fetch employee');
        console.log('Verified: Employee Fetched');

        // 3. Test Calendar Module
        console.log('\n--- Testing Calendar Module ---');
        const event = new CalendarEvent({
            companyId,
            title: 'Test Meeting',
            start: new Date(),
            end: new Date(Date.now() + 3600000),
            type: 'Meeting'
        });
        await event.save();
        console.log('Verified: Event Created', event._id);

        // 4. Test Expense Module
        console.log('\n--- Testing Expense Module ---');
        const expense = new Expense({
            companyId,
            category: 'Testing',
            amount: 100,
            description: 'Test Expense'
        });
        await expense.save();
        console.log('Verified: Expense Created', expense._id);

        // Clean up
        console.log('\n--- Cleaning Up ---');
        await Employee.deleteOne({ _id: employee._id });
        await CalendarEvent.deleteOne({ _id: event._id });
        await Expense.deleteOne({ _id: expense._id });
        console.log('Cleanup Complete.');

        console.log('\nALL TESTS PASSED SUCCESSFULLY.');
        process.exit(0);

    } catch (error) {
        console.error('\nTEST FAILED:', error);
        process.exit(1);
    }
};

runVerification();
