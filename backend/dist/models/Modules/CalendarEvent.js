import mongoose, { Schema } from 'mongoose';
const calendarEventSchema = new Schema({
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
export const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
