import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },

    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },

    taxId: { type: String },

    // Sync metadata
    lastModifiedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
});

export const Customer = mongoose.model('Customer', customerSchema);
