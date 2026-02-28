import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInvoiceItem {
    [key: string]: any;
    inventoryId?: mongoose.Types.ObjectId;
    description?: string;
    quantity?: number;
    price?: number;
    total?: number;
}

export interface IInvoice extends Document {
    companyId: mongoose.Types.ObjectId;
    invoiceNumber: string;
    customerId: mongoose.Types.ObjectId;
    customerName?: string;
    clientAddress?: string;
    gstNumber?: string;
    date: Date;
    items: IInvoiceItem[];
    subtotal?: number;
    taxTotal?: number;
    grandTotal?: number;
    status: 'DRAFT' | 'ISSUED' | 'CANCELLED';
    lastModifiedAt: Date;
    isDeleted: boolean;
    templateId?: mongoose.Types.ObjectId;
    layout?: any[];
    taxRate?: number;
    customAttributes?: { key: string; value: string }[];
}

const invoiceSchema = new Schema<IInvoice>({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    invoiceNumber: { type: String, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String },
    clientAddress: { type: String },
    gstNumber: { type: String },
    date: { type: Date, default: Date.now },
    items: [{
        type: new Schema({
            inventoryId: { type: Schema.Types.ObjectId, ref: 'InventoryItem' },
            description: String,
            quantity: Number,
            price: Number,
            total: Number
        }, { strict: false, _id: false })
    }],
    subtotal: { type: Number },
    taxTotal: { type: Number },
    grandTotal: { type: Number },
    taxRate: { type: Number, default: 10 },
    status: {
        type: String,
        enum: ['DRAFT', 'ISSUED', 'CANCELLED'],
        default: 'DRAFT'
    },
    lastModifiedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    customAttributes: [{
        key: { type: String },
        value: { type: String }
    }],
    templateId: { type: Schema.Types.ObjectId, ref: 'InvoiceTemplate' },
    layout: { type: [Schema.Types.Mixed] }
});

invoiceSchema.index({ companyId: 1, invoiceNumber: 1 }, { unique: true });

export const Invoice: Model<IInvoice> = mongoose.model<IInvoice>('Invoice', invoiceSchema);
