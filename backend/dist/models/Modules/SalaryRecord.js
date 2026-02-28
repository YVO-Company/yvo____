import mongoose, { Schema } from 'mongoose';
const salaryRecordSchema = new Schema({
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
    amount: {
        type: Number,
        required: true
    },
    baseSalary: { type: Number },
    bonus: { type: Number, default: 0 },
    leavesTaken: { type: Number, default: 0 },
    freeLeaves: { type: Number, default: 0 },
    deductionAmount: { type: Number, default: 0 },
    paymentDate: {
        type: Date,
        required: true
    },
    payPeriod: {
        type: String,
        required: true
    },
    remarks: {
        type: String
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Processing'],
        default: 'Paid'
    },
    slipUrl: {
        type: String
    }
}, { timestamps: true });
export const SalaryRecord = mongoose.model('SalaryRecord', salaryRecordSchema);
