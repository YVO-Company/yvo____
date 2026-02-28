import mongoose, { Schema } from 'mongoose';
const leaveRequestSchema = new Schema({
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
export const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
