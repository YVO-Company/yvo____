import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUserMembership {
    companyId: mongoose.Types.ObjectId;
    role: 'OWNER' | 'ADMIN' | 'EMPLOYEE';
    joinedAt: Date;
}

export interface IUser extends Document {
    email: string;
    passwordHash?: string | null;
    googleId?: string;
    fullName?: string;
    avatarUrl?: string;
    isSuperAdmin: boolean;
    memberships: IUserMembership[];
    refreshToken?: string;
    lastLoginAt?: Date;
    createdAt: Date;
}

const userSchema = new Schema<IUser>({
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

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
