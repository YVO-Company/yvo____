import mongoose, { Schema } from 'mongoose';
const paymentSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, default: 'CASH' },
    invoiceAllocation: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }],
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });
export const Payment = mongoose.model('ModulePayment', paymentSchema);
