import mongoose, { Schema } from 'mongoose';
const broadcastMessageSchema = new Schema({
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
export const BroadcastMessage = mongoose.model('BroadcastMessage', broadcastMessageSchema);
