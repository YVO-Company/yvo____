import mongoose, { Schema } from 'mongoose';
const auditLogSchema = new Schema({
    companyId: { type: Schema.Types.Mixed, required: false },
    actorId: { type: Schema.Types.Mixed, required: true },
    action: { type: String, required: true },
    targetId: { type: String },
    targetModel: { type: String },
    details: { type: Object },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now, expires: '365d' }
});
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
