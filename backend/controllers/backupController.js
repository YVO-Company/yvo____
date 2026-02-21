import { BackupJob } from '../models/Global/BackupJob.js';
import { generateBackup } from '../services/backupService.js';
import { AuditLog } from '../models/Global/AuditLog.js';
import path from 'path';
import fs from 'fs';

export const createBackup = async (req, res) => {
    try {
        const { companyId, role, userId } = req.user;
        const filters = req.body.filters || {};

        console.log(`[Backup] Create request - Role: ${role}, User: ${userId}, Company: ${companyId}`);

        if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            console.warn(`[Backup] Permission denied for role: ${role}`);
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        if (!companyId) {
            console.error("[Backup] Missing companyId in request context");
            return res.status(400).json({ message: "Company ID is required" });
        }

        const backupId = `BK-${Date.now()}`;
        const job = new BackupJob({
            companyId,
            createdBy: userId,
            backupId,
            filters,
            status: 'QUEUED'
        });

        await job.save();

        // Start background process
        generateBackup(job._id).catch(err => console.error("Async backup failed:", err));

        // Log action
        await AuditLog.create({
            companyId,
            actorId: userId,
            action: 'BACKUP_CREATED',
            details: { backupId, filters }
        });

        res.status(201).json(job);
    } catch (error) {
        console.error("Create backup error details:", error);
        res.status(500).json({ message: "Failed to create backup job", error: error.message });
    }
};

export const getBackups = async (req, res) => {
    try {
        const { companyId } = req.user;
        const backups = await BackupJob.find({ companyId })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(backups);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch backups" });
    }
};

export const getBackupStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await BackupJob.findById(id);
        if (!job) return res.status(404).json({ message: "Backup job not found" });

        if (job.companyId.toString() !== req.user.companyId?.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json(job);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch backup status" });
    }
};

export const downloadBackup = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await BackupJob.findById(id);
        if (!job || job.status !== 'READY') {
            return res.status(404).json({ message: "Backup file not found or not ready" });
        }

        if (job.companyId.toString() !== req.user.companyId?.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!fs.existsSync(job.filePath)) {
            return res.status(404).json({ message: "File no longer exists on server" });
        }

        // Record Audit Log
        await AuditLog.create({
            companyId: job.companyId,
            actorId: req.user.userId,
            action: 'BACKUP_DOWNLOADED',
            targetId: job._id,
            targetModel: 'BackupJob',
            details: { backupId: job.backupId }
        });

        res.download(job.filePath, path.basename(job.filePath));
    } catch (error) {
        res.status(500).json({ message: "Download failed" });
    }
};

export const deleteBackup = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await BackupJob.findById(id);
        if (!job) return res.status(404).json({ message: "Backup not found" });

        if (job.companyId.toString() !== req.user.companyId?.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Delete file if exists
        if (job.filePath && fs.existsSync(job.filePath)) {
            fs.unlinkSync(job.filePath);
        }

        await BackupJob.findByIdAndDelete(id);

        await AuditLog.create({
            companyId: job.companyId,
            actorId: req.user.userId,
            action: 'BACKUP_DELETED',
            details: { backupId: job.backupId }
        });

        res.json({ message: "Backup deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete backup" });
    }
};
