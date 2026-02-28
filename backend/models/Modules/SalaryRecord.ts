import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISalaryRecord extends Document {
    companyId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    amount: number;
    baseSalary?: number;
    bonus: number;
    leavesTaken: number;
    freeLeaves: number;
    deductionAmount: number;
    paymentDate: Date;
    payPeriod: string;
    remarks?: string;
    status: 'Paid' | 'Pending' | 'Processing';
    slipUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const salaryRecordSchema = new Schema<ISalaryRecord>({
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

export const SalaryRecord: Model<ISalaryRecord> = mongoose.model<ISalaryRecord>('SalaryRecord', salaryRecordSchema);
