import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAuditLog extends Document {
    companyId?: any;
    actorId: any;
    action: string;
    targetId?: string;
    targetModel?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
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

export const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
