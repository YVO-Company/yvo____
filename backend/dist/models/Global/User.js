import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, default: null },
    googleId: { type: String },
    fullName: { type: String },
    avatarUrl: { type: String },
    isSuperAdmin: { type: Boolean, default: false },
    memberships: [{
            companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
            role: {
                type: String,
                enum: ['OWNER', 'ADMIN', 'EMPLOYEE'],
                default: 'EMPLOYEE'
            },
            joinedAt: { type: Date, default: Date.now }
        }],
    refreshToken: { type: String },
    lastLoginAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});
export const User = mongoose.model('User', userSchema);
