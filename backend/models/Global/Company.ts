import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDevice {
    deviceId: string;
    deviceName: string;
    lastSyncAt: Date;
    isRevoked: boolean;
}

export interface ICompany extends Document {
    name: string;
    businessType?: string;
    logo?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    currency: string;
    planId: mongoose.Types.ObjectId;
    subscriptionStatus: 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled';
    trialEndsAt?: Date;
    subscriptionEndsAt?: Date;
    featureFlags: Map<string, boolean>;
    limitOverrides?: {
        users?: number;
        storageGB?: number;
        aiCredits?: number;
    };
    invoiceEditPassword?: string | null;
    maxDevices: number;
    apiKey?: string;
    devices: IDevice[];
    createdAt: Date;
}

const companySchema = new Schema<ICompany>({
    name: { type: String, required: true, trim: true },
    businessType: { type: String },
    logo: { type: String },
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    address: { type: String },
    currency: { type: String, default: 'INR' },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    subscriptionStatus: {
        type: String,
        enum: ['trial', 'active', 'past_due', 'suspended', 'cancelled'],
        default: 'trial'
    },
    trialEndsAt: { type: Date },
    subscriptionEndsAt: { type: Date },
    featureFlags: {
        type: Map,
        of: Boolean,
        default: {}
    },
    limitOverrides: {
        users: { type: Number },
        storageGB: { type: Number },
        aiCredits: { type: Number }
    },
    invoiceEditPassword: { type: String, default: null },
    maxDevices: { type: Number, default: 5 },
    apiKey: { type: String, unique: true, index: true },
    devices: [{
        deviceId: String,
        deviceName: String,
        lastSyncAt: Date,
        isRevoked: { type: Boolean, default: false }
    }],
    createdAt: { type: Date, default: Date.now }
});

export const Company: Model<ICompany> = mongoose.model<ICompany>('Company', companySchema);
