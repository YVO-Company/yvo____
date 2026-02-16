import { SalaryRecord } from '../models/Modules/SalaryRecord.js';
import { LeaveRequest } from '../models/Modules/LeaveRequest.js';
import { CalendarEvent } from '../models/Modules/CalendarEvent.js';
import { BroadcastMessage } from '../models/Modules/BroadcastMessage.js';
import { BroadcastGroup } from '../models/Modules/BroadcastGroup.js';
import { Employee } from '../models/Modules/Employee.js';

// --- Salary ---
export const getSalaryHistory = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const history = await SalaryRecord.find({ employeeId }).sort({ paymentDate: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching salary history' });
    }
};

// --- Leaves ---
export const getLeaveHistory = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const leaves = await LeaveRequest.find({ employeeId }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leave history' });
    }
};

export const applyForLeave = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const companyId = req.user.companyId;
        const { type, startDate, endDate, reason } = req.body;

        const newLeave = new LeaveRequest({
            companyId,
            employeeId,
            type,
            startDate,
            endDate,
            reason,
            status: 'Pending'
        });

        await newLeave.save();
        res.status(201).json(newLeave);
    } catch (error) {
        res.status(500).json({ message: 'Error applying for leave' });
    }
};

// --- Calendar ---
export const getEmployeeCalendar = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const companyId = req.user.companyId;

        // Fetch employee to get category
        const employee = await Employee.findById(employeeId);
        const myCategory = employee.category || 'General';

        const events = await CalendarEvent.find({
            companyId,
            $or: [
                { visibility: 'public' },
                { visibility: 'category', targetCategories: myCategory },
                { attendees: employee.email } // Or ID if attendees stores IDs
            ],
            isDeleted: false
        }).sort({ start: 1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching calendar' });
    }
};

// --- Broadcasts ---
export const getEmployeeBroadcasts = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const companyId = req.user.companyId;

        // 1. Find groups I belong to
        const myGroups = await BroadcastGroup.find({
            companyId,
            members: employeeId
        }).select('_id');

        const groupIds = myGroups.map(g => g._id);

        // 2. Find messages: Target All OR Target My Groups
        const messages = await BroadcastMessage.find({
            companyId,
            $or: [
                { targetAll: true },
                { groupId: { $in: groupIds } }
            ]
        })
            .sort({ createdAt: -1 })
            .populate('senderId', 'fullName')
            .limit(50); // Limit to last 50 messages

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching broadcasts' });
    }
};

// --- Reports ---
export const submitWorkReport = async (req, res) => {
    try {
        const { tasksCompleted, issues, nextDayPlan } = req.body;
        const employeeId = req.user.id;
        const companyId = req.user.companyId;

        // Check if report already exists for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Dynamic import to avoid circular dependencies if any, or just standard import
        const WorkReport = (await import('../models/Modules/WorkReport.js')).default;

        const existingReport = await WorkReport.findOne({
            employee: employeeId,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingReport) {
            return res.status(400).json({ message: 'Report for today already submitted.' });
        }

        const report = new WorkReport({
            employee: employeeId,
            company: companyId,
            tasksCompleted,
            issues,
            nextDayPlan
        });

        await report.save();
        res.status(201).json(report);

    } catch (error) {
        console.error("Error submitting report:", error);
        res.status(500).json({ message: 'Server error submitting report' });
    }
};
