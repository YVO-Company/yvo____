import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true, // e.g., BASIC, PRO, ENTERPRISE
        trim: true
    },
    name: { type: String, required: true },
    priceMonthly: { type: Number, required: true },
    currency: { type: String, default: 'USD' },

    // Default configurations for this plan
    defaultFlags: {
        type: Map,
        of: Boolean,
        default: {}
    },

    defaultLimits: {
        users: { type: Number, default: 1 },
        storageGB: { type: Number, default: 1 },
        aiCredits: { type: Number, default: 0 },
        invoicesPerMonth: { type: Number, default: 100 }
    },

    isArchived: { type: Boolean, default: false }
});

export const Plan = mongoose.model('Plan', planSchema);
