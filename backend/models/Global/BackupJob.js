import mongoose from 'mongoose';

const backupJobSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.Mixed,
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
            type: mongoose.Schema.Types.Mixed
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
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    error: {
        type: String
    }
}, { timestamps: true });

export const BackupJob = mongoose.model('BackupJob', backupJobSchema);
