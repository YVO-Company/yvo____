import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICalendarEvent extends Document {
    companyId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    start: Date;
    end: Date;
    type: 'Meeting' | 'Task' | 'Reminder' | 'Holiday';
    visibility: 'public' | 'private' | 'category';
    targetCategories: string[];
    attendees: string[];
    status: 'Confirmed' | 'Tentative';
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const calendarEventSchema = new Schema<ICalendarEvent>({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['Meeting', 'Task', 'Reminder', 'Holiday'],
        default: 'Meeting'
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'category'],
        default: 'public'
    },
    targetCategories: [{
        type: String
    }],
    attendees: [{
        type: String
    }],
    status: {
        type: String,
        default: 'Confirmed'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const CalendarEvent: Model<ICalendarEvent> = mongoose.model<ICalendarEvent>('CalendarEvent', calendarEventSchema);
