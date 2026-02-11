import mongoose from 'mongoose';
import { User } from './models/Global/User.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Explicitly load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const debugUser = async () => {
    try {
        const uri = process.env.MONGO_URI;
        console.log("Using Mongo URI:", uri ? uri.substring(0, 20) + "..." : "UNDEFINED");

        await mongoose.connect(uri || 'mongodb://localhost:27017/yvo');
        console.log("Connected to DB");

        const allUsers = await User.find({});
        console.log("Found Users:", allUsers.length);

        const output = allUsers.map(u => ({
            email: u.email,
            memberships: u.memberships,
            id: u._id
        }));

        fs.writeFileSync('user_dump.txt', JSON.stringify(output, null, 2));
        console.log("Wrote user data to user_dump.txt");

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugUser();
