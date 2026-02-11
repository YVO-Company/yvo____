import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    businessType: { type: String },

    // Profile Details
    logo: { type: String }, // Base64 or URL
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    address: { type: String },
    currency: { type: String, default: 'INR' },

    // Subscription & Plan
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    subscriptionStatus: {
        type: String,
        enum: ['trial', 'active', 'past_due', 'suspended', 'cancelled'],
        default: 'trial'
    },
    trialEndsAt: { type: Date },
    subscriptionEndsAt: { type: Date },

    // Configuration Overrides
    // These override Plan Defaults. 
    // Final Config = Plan.defaultFlags + Company.featureFlags
    featureFlags: {
        type: Map,
        of: Boolean,
        default: {}
    },

    // Limit Overrides (e.g. purchased add-ons)
    limitOverrides: {
        users: { type: Number },
        storageGB: { type: Number },
        aiCredits: { type: Number }
    },

    // Security Settings
    invoiceEditPassword: { type: String, default: null }, // If set, required to edit invoices

    // Devices
    maxDevices: { type: Number, default: 5 },

    // Desktop Sync
    apiKey: { type: String, unique: true, index: true }, // For desktop app auth
    devices: [{
        deviceId: String,
        deviceName: String,
        lastSyncAt: Date,
        isRevoked: { type: Boolean, default: false }
    }],

    createdAt: { type: Date, default: Date.now }
});

export const Company = mongoose.model('Company', companySchema);
