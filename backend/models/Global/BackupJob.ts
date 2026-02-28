import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBackupJob extends Document {
    companyId: mongoose.Types.ObjectId;
    createdBy: any;
    backupId: string;
    status: 'QUEUED' | 'PROCESSING' | 'READY' | 'FAILED' | 'EXPIRED';
    progress: number;
    currentModule?: string;
    filters?: {
        dateRange?: any;
        modules?: string[];
        employeeId?: string;
        department?: string;
        branch?: string;
        status?: string;
        searchTerm?: string;
        includeFiles: boolean;
        includePII: boolean;
    };
    recordCounts: Map<string, number>;
    filePath?: string;
    fileSize?: number;
    expiresAt: Date;
    error?: string;
}

const backupJobSchema = new Schema<IBackupJob>({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    createdBy: {
        type: Schema.Types.Mixed,
        required: true
    },
    backupId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['QUEUED', 'PROCESSING', 'READY', 'FAILED', 'EXPIRED'],
        default: 'QUEUED'
    },
    progress: {
        type: Number,
        default: 0
    },
    currentModule: {
        type: String
    },
    filters: {
        dateRange: {
            type: Schema.Types.Mixed
        },
        modules: [String],
        employeeId: String,
        department: String,
        branch: String,
        status: String,
        searchTerm: String,
        includeFiles: { type: Boolean, default: true },
        includePII: { type: Boolean, default: false }
    },
    recordCounts: {
        type: Map,
        of: Number,
        default: {}
    },
    filePath: {
        type: String
    },
    fileSize: {
        type: Number
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    error: {
        type: String
    }
}, { timestamps: true });

export const BackupJob: Model<IBackupJob> = mongoose.model<IBackupJob>('BackupJob', backupJobSchema);
