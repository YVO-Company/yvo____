import mongoose, { Schema } from 'mongoose';
const inventoryItemSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    quantityOnHand: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 5 },
    costPrice: { type: Number },
    sellingPrice: { type: Number },
    category: { type: String },
    lastModifiedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
});
inventoryItemSchema.index({ companyId: 1, sku: 1 }, { unique: true });
export const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
