import mongoose, { Schema } from 'mongoose';
const customerSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    taxId: { type: String },
    lastModifiedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
});
export const Customer = mongoose.model('Customer', customerSchema);
