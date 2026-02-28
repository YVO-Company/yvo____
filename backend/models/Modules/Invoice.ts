import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInvoiceItem {
    inventoryId?: mongoose.Types.ObjectId;
    description?: string;
    quantity?: number;
    price?: number;
    total?: number;
}

export interface IInvoice extends Document {
    companyId: mongoose.Types.ObjectId;
    invoiceNumber: string;
    customerId?: mongoose.Types.ObjectId;
    customerName?: string;
    clientAddress?: string;
    gstNumber?: string;
    date: Date;
    dueDate?: Date;
    items: IInvoiceItem[];
    subtotal?: number;
    taxTotal?: number;
    grandTotal?: number;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    lastModifiedAt: Date;
    isDeleted: boolean;
}

const invoiceSchema = new Schema<IInvoice>({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    invoiceNumber: { type: String, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String },
    clientAddress: { type: String },
    gstNumber: { type: String },
    date: { type: Date, default: Date.now },
    dueDate: { type: Date },
    items: [{
        inventoryId: { type: Schema.Types.ObjectId, ref: 'InventoryItem' },
        description: String,
        quantity: Number,
        price: Number,
        total: Number
    }],
    subtotal: { type: Number },
    taxTotal: { type: Number },
    grandTotal: { type: Number },
    status: {
        type: String,
        enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'],
        default: 'DRAFT'
    },
    lastModifiedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
});

invoiceSchema.index({ companyId: 1, invoiceNumber: 1 }, { unique: true });

export const Invoice: Model<IInvoice> = mongoose.model<IInvoice>('Invoice', invoiceSchema);
