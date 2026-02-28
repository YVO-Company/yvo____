import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IClientLogo extends Document {
    name: string;
    logoUrl: string;
    createdAt: Date;
}

const clientLogoSchema = new Schema<IClientLogo>({
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const ClientLogo: Model<IClientLogo> = mongoose.model<IClientLogo>('ClientLogo', clientLogoSchema);
