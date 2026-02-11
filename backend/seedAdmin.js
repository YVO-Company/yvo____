import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load env vars
dotenv.config();

// Define User Schema (Simplified for seeding)
const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    passwordHash: String,
    isSuperAdmin: { type: Boolean, default: false },
    memberships: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
});

// Check if model already exists to avoid overwrite error if run multiple times in same process (not likely for script but good practice)
const User = mongoose.models.User || mongoose.model('User', userSchema);

const seedAdmin = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is missing in .env");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB:', process.env.MONGO_URI);

        const email = process.env.ADMIN_EMAIL || 'admin@example.com';
        const password = process.env.ADMIN_PASSWORD || 'secret';
        const username = process.env.ADMIN_USERNAME || 'Super Admin';

        let user = await User.findOne({ email });

        if (user) {
            console.log('Admin user found.');
            // Update to be sure they are super admin
            user.isSuperAdmin = true;
            user.fullName = username;
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(password, salt);
            await user.save();
            console.log('Admin permissions and password updated.');
        } else {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            user = await User.create({
                fullName: username,
                email,
                passwordHash,
                isSuperAdmin: true,
                memberships: []
            });
            console.log('Admin user created successfully.');
        }

        console.log('-----------------------------------');
        console.log('SUPER ADMIN CREDENTIALS:');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
