import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBroadcastGroup extends Document {
    companyId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    members: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

const broadcastGroupSchema = new Schema<IBroadcastGroup>({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    }]
}, { timestamps: true });

export const BroadcastGroup: Model<IBroadcastGroup> = mongoose.model<IBroadcastGroup>('BroadcastGroup', broadcastGroupSchema);
