import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IExpense extends Document {
    companyId: mongoose.Types.ObjectId;
    category: string;
    amount: number;
    date: Date;
    description?: string;
    paymentMethod?: string;
    receiptUrl?: string;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const expenseSchema = new Schema<IExpense>({
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

export const Expense: Model<IExpense> = mongoose.model<IExpense>('Expense', expenseSchema);
