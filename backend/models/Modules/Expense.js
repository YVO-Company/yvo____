import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    category: {
        type: String,
        required: true // e.g., 'Rent', 'Utilities', 'Salaries', 'Supplies'
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
        type: String, // 'Cash', 'Bank Transfer', 'Credit Card'
    },
    receiptUrl: {
        type: String // Optional link to image/doc
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Expense = mongoose.model('Expense', expenseSchema);
