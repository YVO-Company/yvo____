import mongoose from 'mongoose';

const salaryRecordSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    amount: {
        type: Number,
        required: true // Final Amount Paid
    },
    baseSalary: { type: Number },
    leavesTaken: { type: Number, default: 0 },
    freeLeaves: { type: Number, default: 0 },
    deductionAmount: { type: Number, default: 0 },
    paymentDate: {
        type: Date,
        required: true
    },
    payPeriod: {
        // e.g., "January 2026", "2026-01"
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
        type: String // URL to PDF
    }
}, { timestamps: true });

export const SalaryRecord = mongoose.model('SalaryRecord', salaryRecordSchema);
