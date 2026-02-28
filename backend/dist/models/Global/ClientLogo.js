import mongoose, { Schema } from 'mongoose';
const clientLogoSchema = new Schema({
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
export const ClientLogo = mongoose.model('ClientLogo', clientLogoSchema);
