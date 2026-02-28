import mongoose, { Schema } from 'mongoose';
const companySchema = new Schema({
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
    createdAt: { type: Date, default: Date.now },
    invoiceAttributes: [{ type: String }]
});
export const Company = mongoose.model('Company', companySchema);
