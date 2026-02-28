import mongoose, { Schema } from 'mongoose';
const broadcastGroupSchema = new Schema({
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
export const BroadcastGroup = mongoose.model('BroadcastGroup', broadcastGroupSchema);
