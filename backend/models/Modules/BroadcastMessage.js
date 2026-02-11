import mongoose from 'mongoose';

const broadcastMessageSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin who sent the message
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BroadcastGroup'
        // If null, could mean "All Employees" or handled differently
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
        type: String // URLs
    }]
}, { timestamps: true });

export const BroadcastMessage = mongoose.model('BroadcastMessage', broadcastMessageSchema);
