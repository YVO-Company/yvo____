import mongoose from 'mongoose';

const workReportSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
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

export default mongoose.model('WorkReport', workReportSchema);
