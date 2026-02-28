import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEmployeeSalaryHistory {
    amount: number;
    changeDate: Date;
}

export interface IEmployee extends Document {
    companyId: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password?: string;
    category: string;
    avatar?: string;
    position: string;
    department?: string;
    salary: number;
    freeLeavesPerMonth: number;
    workingDaysPerWeek: number;
    salaryHistory: IEmployeeSalaryHistory[];
    status: 'Active' | 'On Leave' | 'Terminated';
    dateHired: Date;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const employeeSchema = new Schema<IEmployee>({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    avatar: {
        type: String
    },
    position: {
        type: String,
        required: true
    },
    department: {
        type: String
    },
    salary: {
        type: Number,
        default: 0
    },
    freeLeavesPerMonth: {
        type: Number,
        default: 1
    },
    workingDaysPerWeek: {
        type: Number,
        default: 6
    },
    salaryHistory: [{
        amount: { type: Number, required: true },
        changeDate: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Terminated'],
        default: 'Active'
    },
    dateHired: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Employee: Model<IEmployee> = mongoose.model<IEmployee>('Employee', employeeSchema);
