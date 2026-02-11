import mongoose from 'mongoose';
import { Employee } from './models/Modules/Employee.js'; // Adjust path
import dotenv from 'dotenv';
dotenv.config();

const employeesToCreate = [
    {
        firstName: "Rahul",
        lastName: "Sharma",
        email: "rahul.sharma@example.com",
        phone: "9876543210",
        position: "Senior Developer",
        department: "Engineering",
        salary: 1200000,
        workingDaysPerWeek: 5,
        freeLeavesPerMonth: 1,
        category: "General",
        password: "password123"
    },
    {
        firstName: "Priya",
        lastName: "Verma",
        email: "priya.verma@example.com",
        phone: "9876543211",
        position: "Marketing Manager",
        department: "Marketing",
        salary: 900000,
        workingDaysPerWeek: 6,
        freeLeavesPerMonth: 2,
        category: "Sales",
        password: "password123"
    },
    {
        firstName: "Amit",
        lastName: "Patel",
        email: "amit.patel@example.com",
        phone: "9876543212",
        position: "Sales Executive",
        department: "Sales",
        salary: 600000,
        workingDaysPerWeek: 6,
        freeLeavesPerMonth: 1,
        category: "Sales",
        password: "password123"
    },
    {
        firstName: "Sneha",
        lastName: "Reddy",
        email: "sneha.reddy@example.com",
        phone: "9876543213",
        position: "HR Specialist",
        department: "HR",
        salary: 750000,
        workingDaysPerWeek: 5,
        freeLeavesPerMonth: 1,
        category: "Management",
        password: "password123"
    },
    {
        firstName: "Vikram",
        lastName: "Singh",
        email: "vikram.singh@example.com",
        phone: "9876543214",
        position: "Support Lead",
        department: "Customer Support",
        salary: 500000,
        workingDaysPerWeek: 6,
        freeLeavesPerMonth: 0,
        category: "General",
        password: "password123"
    }
];

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yvo');
        console.log('Connected');

        // Check for existing company (assuming user has one, picking first one found or needing a specific ID)
        // For simplicity, we'll try to find a company ID to associate with.
        // In a real scenario, we might need the user's specific company ID.
        // Let's assume we can attach them to the first company found.
        const Company = mongoose.model('Company', new mongoose.Schema({ name: String }));
        const company = await Company.findOne();

        if (!company) {
            console.log("No company found! Create a company first.");
            process.exit(1);
        }

        console.log(`Adding employees to company: ${company.name} (${company._id})`);

        for (const empData of employeesToCreate) {
            const exists = await Employee.findOne({ email: empData.email });
            if (!exists) {
                await Employee.create({ ...empData, companyId: company._id });
                console.log(`Created: ${empData.firstName} ${empData.lastName}`);
            } else {
                console.log(`Skipped (Exists): ${empData.firstName} ${empData.lastName}`);
            }
        }

        console.log("Done!");

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
