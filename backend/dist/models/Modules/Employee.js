import mongoose, { Schema } from 'mongoose';
const employeeSchema = new Schema({
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
export const Employee = mongoose.model('Employee', employeeSchema);
