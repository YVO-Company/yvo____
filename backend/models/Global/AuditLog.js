import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: false }, // Can be null for System-level audits
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    action: { type: String, required: true }, // e.g. "COMPANY_CREATED", "FLAG_CHANGED", "INVOICE_DELETED"
    targetId: { type: String }, // ID of the object being acted upon
    targetModel: { type: String }, // "Company", "Invoice", etc.

    details: { type: Object }, // Snapshot of changes or diff
    ipAddress: { type: String },
    userAgent: { type: String },

    timestamp: { type: Date, default: Date.now, expires: '365d' } // Auto-expire after 1 year?
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
