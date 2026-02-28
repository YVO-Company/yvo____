import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWorkReport extends Document {
    employee: mongoose.Types.ObjectId;
    company: mongoose.Types.ObjectId;
    date: Date;
    tasksCompleted: string;
    issues?: string;
    nextDayPlan?: string;
    status: 'Submitted' | 'Reviewed';
    createdAt?: Date;
    updatedAt?: Date;
}

const workReportSchema = new Schema<IWorkReport>({
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

export const WorkReport: Model<IWorkReport> = mongoose.model<IWorkReport>('WorkReport', workReportSchema);
