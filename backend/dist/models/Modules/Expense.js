import mongoose, { Schema } from 'mongoose';
const expenseSchema = new Schema({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String
    },
    paymentMethod: {
        type: String,
    },
    receiptUrl: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
export const Expense = mongoose.model('Expense', expenseSchema);
