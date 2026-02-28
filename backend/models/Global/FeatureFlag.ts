import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFeatureFlag extends Document {
    key: string;
    value: any;
    description?: string;
    scope: 'global' | 'beta' | 'internal';
    isEnabled: boolean;
    createdAt: Date;
}

const featureFlagSchema = new Schema<IFeatureFlag>({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
    scope: {
        type: String,
        enum: ['global', 'beta', 'internal'],
        default: 'global'
    },
    isEnabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

export const FeatureFlag: Model<IFeatureFlag> = mongoose.model<IFeatureFlag>('FeatureFlag', featureFlagSchema);
