import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBroadcastMessage extends Document {
    companyId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    groupId?: mongoose.Types.ObjectId;
    targetAll: boolean;
    content: string;
    attachments: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

const broadcastMessageSchema = new Schema<IBroadcastMessage>({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    groupId: {
        type: Schema.Types.ObjectId,
        ref: 'BroadcastGroup'
    },
    targetAll: {
        type: Boolean,
        default: false
    },
    content: {
        type: String,
        required: true
    },
    attachments: [{
        type: String
    }]
}, { timestamps: true });

export const BroadcastMessage: Model<IBroadcastMessage> = mongoose.model<IBroadcastMessage>('BroadcastMessage', broadcastMessageSchema);
