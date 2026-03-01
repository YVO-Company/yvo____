import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPayment extends Document {
    companyId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    amount: number;
    date: Date;
    method: string;
    invoiceAllocation?: mongoose.Types.ObjectId[];
    isDeleted: boolean;
}

const paymentSchema = new Schema<IPayment>({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, default: 'CASH' },
    invoiceAllocation: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }],
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);
