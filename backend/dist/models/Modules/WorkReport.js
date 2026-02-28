import mongoose, { Schema } from 'mongoose';
const workReportSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    tasksCompleted: {
        type: String,
        required: true
    },
    issues: {
        type: String
    },
    nextDayPlan: {
        type: String
    },
    status: {
        type: String,
        enum: ['Submitted', 'Reviewed'],
        default: 'Submitted'
    }
}, { timestamps: true });
export const WorkReport = mongoose.model('WorkReport', workReportSchema);
