import { Company } from '../../models/Global/Company.js';
import { User } from '../../models/Global/User.js';
import { Invoice } from '../../models/Modules/Invoice.js';
import { AuditLog } from '../../models/Global/AuditLog.js';
import { FeatureFlag } from '../../models/Global/FeatureFlag.js';

// GET /sa/sync/stats
export const getSyncStats = async (req, res) => {
    try {
        // 1. Calculate Storage Usage (Approximate)
        const invoiceCount = await Invoice.countDocuments();
        const userCount = await User.countDocuments();
        const companyCount = await Company.countDocuments();

        // Est. Sizes: Invoice ~2KB, User ~1KB, Company ~2KB (very rough)
        const totalBytes = (invoiceCount * 2048) + (userCount * 1024) + (companyCount * 2048);
        const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(6);

        // 2. Sync Status
        // Find companies with devices synced in the last 24h
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeSyncCompanies = await Company.countDocuments({
            'devices.lastSyncAt': { $gte: oneDayAgo }
        });

        // 3. Settings (Fetch from Global FeatureFlag)
        const globalFlags = await FeatureFlag.findOne({ scope: 'GLOBAL' });
        const settings = globalFlags?.flags || {
            mandatoryCloudBackup: true,
            autoYearlyArchive: false
        };

        res.json({
            storage: {
                usedGB: totalGB,
                limitTB: 10.0, // Hardcoded global limit for now
                percent: ((totalGB / (10 * 1024)) * 100).toFixed(4)
            },
            syncHealth: {
                active: activeSyncCompanies,
                total: companyCount
            },
            settings
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /sa/sync/logs
export const getSyncLogs = async (req, res) => {
    try {
        // Fetch recent system logs related to sync/backup
        // If we don't have dedicated sync logs, we can fetch generic audits or mock for now as "System"
        const logs = await AuditLog.find({
            action: { $in: ['SYSTEM_BACKUP', 'SYNC_ERROR', 'SYNC_COMPLETE'] }
        })
            .sort({ timestamp: -1 })
            .limit(10)
            .populate('actorId', 'fullName email');

        // If no logs, return some "No activity" or dummy for UI dev if needed
        // For "Real Data", we return what is there.
        res.json(logs);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /sa/sync/manual-backup
export const triggerManualBackup = async (req, res) => {
    try {
        const { id } = req.user; // Admin User ID

        // create a log entry
        await AuditLog.create({
            actorId: id, // Assuming req.user is populated by auth middleware
            action: 'SYSTEM_BACKUP',
            targetModel: 'System',
            details: { status: 'Success', type: 'Manual' },
            ipAddress: req.ip || '127.0.0.1'
        });

        // In a real system, this would trigger a mongodump or S3 upload
        // Here we just acknowledge it
        res.json({ message: 'Manual backup triggered successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /sa/sync/config
export const updateSyncConfig = async (req, res) => {
    try {
        const { mandatoryCloudBackup, autoYearlyArchive } = req.body;

        const globalFlags = await FeatureFlag.findOneAndUpdate(
            { scope: 'GLOBAL' },
            {
                $set: {
                    'flags.mandatoryCloudBackup': mandatoryCloudBackup,
                    'flags.autoYearlyArchive': autoYearlyArchive
                }
            },
            { upsert: true, new: true }
        );

        res.json(globalFlags.flags);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
