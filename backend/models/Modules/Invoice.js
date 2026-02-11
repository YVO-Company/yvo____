import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },

    invoiceNumber: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String },
    clientAddress: { type: String },
    gstNumber: { type: String },

    date: { type: Date, default: Date.now },
    dueDate: { type: Date },

    items: [{
        inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
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

    // Sync metadata
    lastModifiedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
});

// Compound index for unique invoice numbers per company
invoiceSchema.index({ companyId: 1, invoiceNumber: 1 }, { unique: true });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
