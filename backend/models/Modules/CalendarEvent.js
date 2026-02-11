import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
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
        type: String // Can be email addresses or User IDs
    }],
    status: {
        type: String, // 'Confirmed', 'Tentative'
        default: 'Confirmed'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
