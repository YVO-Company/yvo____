import mongoose from 'mongoose';
import { User } from './models/Global/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yvo');
        console.log("Connected to DB");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const user = await User.findOneAndUpdate(
            { email: 'user@company.com' },
            {
                passwordHash: hashedPassword,
                // Ensure they have the correct plan/role if needed, but memberships looked ok
            },
            { new: true }
        );

        if (user) {
            console.log("Password updated for user@company.com to '123456'");
        } else {
            console.log("User not found");
        }

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

resetPassword();
