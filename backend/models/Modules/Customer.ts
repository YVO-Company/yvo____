import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICustomer extends Document {
    companyId: mongoose.Types.ObjectId;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    lastModifiedAt: Date;
    isDeleted: boolean;
}

const customerSchema = new Schema<ICustomer>({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    taxId: { type: String },
    lastModifiedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
});

export const Customer: Model<ICustomer> = mongoose.model<ICustomer>('Customer', customerSchema);
