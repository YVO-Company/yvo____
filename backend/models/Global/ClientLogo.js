import mongoose from 'mongoose';

const clientLogoSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const ClientLogo = mongoose.model('ClientLogo', clientLogoSchema);
