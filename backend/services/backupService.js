import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { stringify } from 'csv-stringify/sync';
import { BackupJob } from '../models/Global/BackupJob.js';
import { Company } from '../models/Global/Company.js';
import { User } from '../models/Global/User.js';
import { Employee } from '../models/Modules/Employee.js';
import { Invoice } from '../models/Modules/Invoice.js';
import { Expense } from '../models/Modules/Expense.js';
import { Customer } from '../models/Modules/Customer.js';
import { InventoryItem } from '../models/Modules/InventoryItem.js';
import { LeaveRequest } from '../models/Modules/LeaveRequest.js';
import { SalaryRecord } from '../models/Modules/SalaryRecord.js';
import { WorkReport } from '../models/Modules/WorkReport.js';
import { CalendarEvent } from '../models/Modules/CalendarEvent.js';
import { BroadcastGroup } from '../models/Modules/BroadcastGroup.js';
import { BroadcastMessage } from '../models/Modules/BroadcastMessage.js';
import { AuditLog } from '../models/Global/AuditLog.js';

const MODULE_MODELS = {
    users: User,
    employees: Employee,
    invoices: Invoice,
    expenses: Expense,
    customers: Customer,
    inventory: InventoryItem,
    leaves: LeaveRequest,
    payroll: SalaryRecord,
    work_reports: WorkReport,
    calendar: CalendarEvent,
    broadcast_groups: BroadcastGroup,
    broadcast_messages: BroadcastMessage
};

const SENSITIVE_FIELDS = ['password', 'passwordHash', 'refreshToken', 'googleId', 'apiKey'];
const PII_FIELDS = ['email', 'phone', 'address', 'fullName', 'firstName', 'lastName'];

const IDENTITY_FIELDS = [
    'companyId', 'employeeId', 'customerId', 'userId', 'createdBy',
    'employee', 'senderId', 'receiverId', 'inventoryId', 'actorId', 'targetId'
];

const formatValueForHuman = (key, value) => {
    if (!value && value !== 0 && value !== false) return '';

    // 1. Handle Dates
    if (value instanceof Date) {
        return value.toLocaleString();
    }
    if ((key.toLowerCase().endsWith('at') || key.toLowerCase().endsWith('date')) && typeof value === 'number') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? value : date.toLocaleString();
    }

    // 2. Handle Objects (populated or nested)
    if (typeof value === 'object' && !Array.isArray(value)) {
        // If it's a populated object, look for any field that represents a "Name"
        const nameCandidates = [
            value.name,
            value.fullName,
            (value.firstName || value.lastName) ? `${value.firstName || ''} ${value.lastName || ''}`.trim() : null,
            value.title,
            value.sku ? `${value.sku} - ${value.name || ''}` : null,
            value.email, // Last resort for users
            value.backupId // For backup jobs
        ];

        const winner = nameCandidates.find(c => c && typeof c === 'string');
        if (winner) return winner;

        // Fallback for ObjectIDs that weren't populated or lack name fields
        const strValue = String(value);
        if (strValue !== '[object Object]') return strValue;

        // Final fallback: JSON string
        return JSON.stringify(value);
    }

    // 3. Handle Arrays
    if (Array.isArray(value)) {
        return value.map(item => {
            if (typeof item === 'object') {
                // Special case: Invoice Items
                if (item.inventoryId || item.description) {
                    const desc = (formatValueForHuman('item', item.inventoryId) || item.description || 'Item').trim();
                    const qty = item.quantity || 0;
                    const price = item.price || 0;
                    const total = item.total || (qty * price);
                    return `${desc} (${qty} x ${price} = ${total})`;
                }
                return formatValueForHuman('array_item', item);
            }
            return item;
        }).join('; ');
    }

    return value;
};

export const generateBackup = async (jobId) => {
    const job = await BackupJob.findById(jobId);
    if (!job) return;

    const company = await Company.findById(job.companyId);
    if (!company) {
        job.status = 'FAILED';
        job.error = 'Company not found';
        await job.save();
        return;
    }

    try {
        job.status = 'PROCESSING';
        await job.save();

        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `YVO_BACKUP_${company.name.replace(/\s+/g, '_')}_${timestamp}_${job.backupId}.zip`;
        const tempDir = path.join(process.cwd(), 'temp', 'backups');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const filePath = path.join(tempDir, fileName);
        const output = fs.createWriteStream(filePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', async () => {
            job.status = 'READY';
            job.progress = 100;
            job.filePath = filePath;
            job.fileSize = archive.pointer();
            await job.save();

            // Record in Audit Log
            await AuditLog.create({
                companyId: company._id,
                actorId: job.createdBy,
                action: 'BACKUP_READY',
                targetId: job._id,
                targetModel: 'BackupJob',
                details: { backupId: job.backupId, size: job.fileSize }
            });
        });

        archive.on('error', async (err) => {
            throw err;
        });

        archive.pipe(output);

        // 1. Generate Manifest
        const manifest = {
            backupId: job.backupId,
            companyId: company._id,
            companyName: company.name,
            createdAt: job.createdAt,
            createdBy: job.createdBy,
            includedModules: job.filters.modules,
            includesFiles: job.filters.includeFiles,
            piiIncluded: job.filters.includePII,
            schemaVersion: '1.0.0'
        };
        const readmeContent = `YVO Data Export - README

Your company data has been exported in two formats:
1. CSV Folder: Best for reading in Microsoft Excel, Google Sheets, or sharing with customers.
2. JSON Folder: Technical data format for system restores.

NOTES ON YOUR DATA:
- DATES: All dates are formatted to your local timezone for easy reading.
- NAMES: We have automatically replaced technical IDs (like '698da...') with actual Names (e.g., Company Name, Employee Name) wherever possible.
- INVOICES: Item details are combined into a single easy-to-read column.

This backup is valid for 7 days from the creation date.
Generated on: ${new Date(job.createdAt).toLocaleString()}
`;
        archive.append(readmeContent, { name: 'README.txt' });
        archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest/manifest.json' });

        // 2. Export Data
        const modulesToExport = job.filters.modules && job.filters.modules.length > 0
            ? job.filters.modules
            : Object.keys(MODULE_MODELS);

        let processedModules = 0;
        const totalModules = modulesToExport.length;

        for (const moduleName of modulesToExport) {
            const Model = MODULE_MODELS[moduleName];
            if (!Model) continue;

            job.currentModule = moduleName;
            job.progress = Math.round((processedModules / totalModules) * 100);
            await job.save();

            // Build query
            const companyField = Model.schema.paths.companyId ? 'companyId' : 'company';
            let query = { [companyField]: company._id };


            // Apply Date Filters
            if (job.filters.dateRange?.start || job.filters.dateRange?.end) {
                const dateField = getDateFieldForModule(moduleName);
                query[dateField] = {};
                if (job.filters.dateRange.start) query[dateField].$gte = new Date(job.filters.dateRange.start);
                if (job.filters.dateRange.end) query[dateField].$lte = new Date(job.filters.dateRange.end);
            }

            // Special handling for User model (filter by memberships)
            if (moduleName === 'users') {
                query = { 'memberships.companyId': company._id };
            }

            // Global Population: Find all identity fields that exist in this model's schema and have a ref
            let mQuery = Model.find(query);
            IDENTITY_FIELDS.forEach(field => {
                const path = Model.schema.paths[field];
                if (path && (path.options?.ref || path.instance === 'ObjectID')) {
                    mQuery = mQuery.populate(field);
                }
            });

            // Special case for nested paths (like invoice items)
            if (moduleName === 'invoices') {
                mQuery = mQuery.populate('items.inventoryId');
            }

            const cursor = mQuery.cursor();
            const records = [];
            let count = 0;

            for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
                const data = doc.toObject();

                // Remove sensitive fields
                SENSITIVE_FIELDS.forEach(f => delete data[f]);

                // Mask PII if not included
                if (!job.filters.includePII) {
                    PII_FIELDS.forEach(f => {
                        if (data[f]) data[f] = maskPII(data[f], f);
                    });
                }

                records.push(data);
                count++;
            }

            if (records.length > 0) {
                // 1. Add JSON (Raw data for technical backup/restore)
                archive.append(JSON.stringify(records, null, 2), { name: `data/${moduleName}/records.json` });

                // 2. Prepare CSV (Human-friendly format)
                const csvRecords = records.map(r => {
                    const humanRow = {};
                    for (const [key, value] of Object.entries(r)) {
                        humanRow[key] = formatValueForHuman(key, value);
                    }
                    return humanRow;
                });

                // Add CSV
                const csvData = stringify(csvRecords, { header: true });
                archive.append(csvData, { name: `data/${moduleName}/records.csv` });
            }

            // Add Summary
            const summary = {
                module: moduleName,
                recordCount: count,
                filtersApplied: query
            };
            archive.append(JSON.stringify(summary, null, 2), { name: `data/${moduleName}/summary.json` });

            job.recordCounts.set(moduleName, count);
            processedModules++;
        }

        // 3. Add Files
        if (job.filters.includeFiles) {
            const filesIndex = [];
            archive.append(JSON.stringify(filesIndex, null, 2), { name: 'files/files_index.json' });
        }

        await archive.finalize();

    } catch (error) {
        console.error("Backup generation failed:", error);
        job.status = 'FAILED';
        job.error = error.message;
        await job.save();

        await AuditLog.create({
            companyId: company._id,
            actorId: job.createdBy,
            action: 'BACKUP_FAILED',
            targetId: job._id,
            targetModel: 'BackupJob',
            details: { error: error.message }
        });
    }
};

const getDateFieldForModule = (module) => {
    const mapping = {
        expenses: 'date',
        invoices: 'date',
        leaves: 'startDate',
        payroll: 'paymentDate',
        work_reports: 'date'
    };
    return mapping[module] || 'createdAt';
};

const maskPII = (value, field) => {
    if (typeof value !== 'string') return value;
    if (field === 'email') return value.replace(/(?<=.{2}).(?=[^@]*?@)/g, '*');
    if (field === 'phone') return value.replace(/.(?=.{4})/g, '*');
    return '***';
};
