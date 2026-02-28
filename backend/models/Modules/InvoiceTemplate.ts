import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInvoiceTemplateLayout {
    id?: string;
    type?: string;
    config?: any;
}

export interface IInvoiceTemplateItem {
    inventoryId?: mongoose.Types.ObjectId;
    description?: string;
    quantity: number;
    price: number;
    total: number;
}

export interface IInvoiceTemplate extends Document {
    companyId: mongoose.Types.ObjectId;
    name: string;
    type: 'GLOBAL' | 'COMPANY';
    themeIdentifier: string;
    layout: IInvoiceTemplateLayout[];
    items: IInvoiceTemplateItem[];
    taxRate: number;
    notes: string;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const invoiceTemplateSchema = new Schema<IInvoiceTemplate>({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: function (this: IInvoiceTemplate) { return this.type === 'COMPANY'; }
    },
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['GLOBAL', 'COMPANY'],
        default: 'COMPANY'
    },
    themeIdentifier: { type: String, default: 'classic' },
    layout: [{
        id: String,
        type: { type: String },
        config: { type: Schema.Types.Mixed }
    }],
    items: [{
        inventoryId: { type: Schema.Types.ObjectId, ref: 'InventoryItem' },
        description: String,
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    }],
    taxRate: { type: Number, default: 10 },
    notes: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const InvoiceTemplate: Model<IInvoiceTemplate> = mongoose.model<IInvoiceTemplate>('InvoiceTemplate', invoiceTemplateSchema);
