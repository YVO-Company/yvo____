import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInventoryItem extends Document {
    companyId: mongoose.Types.ObjectId;
    sku: string;
    name: string;
    description?: string;
    quantityOnHand: number;
    reorderLevel: number;
    costPrice?: number;
    sellingPrice?: number;
    category?: string;
    lastModifiedAt: Date;
    isDeleted: boolean;
}

const inventoryItemSchema = new Schema<IInventoryItem>({
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

export const InventoryItem: Model<IInventoryItem> = mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);
