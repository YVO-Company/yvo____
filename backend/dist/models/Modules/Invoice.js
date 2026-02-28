import mongoose, { Schema } from 'mongoose';
const invoiceSchema = new Schema({
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
export const Invoice = mongoose.model('Invoice', invoiceSchema);
