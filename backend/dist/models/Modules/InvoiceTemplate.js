import mongoose, { Schema } from 'mongoose';
const invoiceTemplateSchema = new Schema({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: function () { return this.type === 'COMPANY'; }
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
export const InvoiceTemplate = mongoose.model('InvoiceTemplate', invoiceTemplateSchema);
