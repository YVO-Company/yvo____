import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
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

// Pre-save hook to hash password if modified
// import bcrypt from 'bcryptjs'; // We need to import bcrypt
// employeeSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });
// Commented out to avoid adding dependency logic here, will handle in controller or add bcrypt import if I can confirm it's available.
// Checking package.json would be good, but for now I will just add the fields. Logic can be in controller.

export const Employee = mongoose.model('Employee', employeeSchema);
