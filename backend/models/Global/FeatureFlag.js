import mongoose from 'mongoose';

const featureFlagSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true }, // Boolean, Number, or String
    description: { type: String },
    scope: {
        type: String,
        enum: ['global', 'beta', 'internal'],
        default: 'global'
    },
    isEnabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

export const FeatureFlag = mongoose.model('FeatureFlag', featureFlagSchema);
