import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    passwordHash: String,
    isSuperAdmin: Boolean,
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const resetPass = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yvo');
        console.log('Connected.');

        const email = 'admin@example.com';
        const newPass = 'secret';

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPass, salt);

        const res = await User.updateOne(
            { email }, 
            { $set: { passwordHash: hash, isSuperAdmin: true } }
        );

        if (res.matchedCount === 0) {
            console.log('User not found, constructing new one...');
             await User.create({
                fullName: 'Super Admin',
                email,
                passwordHash: hash,
                isSuperAdmin: true,
                memberships: []
            });
            console.log('Admin user created.');
        } else {
             console.log('Admin password updated.');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPass();
