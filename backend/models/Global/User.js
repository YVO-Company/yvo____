import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String }, // Null if Google-only
    googleId: { type: String },
    fullName: { type: String },
    avatarUrl: { type: String },

    isSuperAdmin: { type: Boolean, default: false }, // The "God Mode" flag

    // Multi-tenancy: One user can belong to multiple companies
    memberships: [{
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
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
