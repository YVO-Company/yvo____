import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ILeaveRequest extends Document {
    companyId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    type: 'Sick Leave' | 'Casual Leave' | 'Paid Leave' | 'Unpaid Leave';
    startDate: Date;
    endDate: Date;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    adminRemark?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    employeeId: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    type: {
        type: String,
        enum: ['Sick Leave', 'Casual Leave', 'Paid Leave', 'Unpaid Leave'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    adminRemark: {
        type: String
    }
}, { timestamps: true });

export const LeaveRequest: Model<ILeaveRequest> = mongoose.model<ILeaveRequest>('LeaveRequest', leaveRequestSchema);
