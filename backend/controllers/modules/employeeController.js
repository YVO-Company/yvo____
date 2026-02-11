// ... existing imports
import { BroadcastGroup } from '../../models/Modules/BroadcastGroup.js';
import { BroadcastMessage } from '../../models/Modules/BroadcastMessage.js';
import { SalaryRecord } from '../../models/Modules/SalaryRecord.js';
import { Expense } from '../../models/Modules/Expense.js';
import bcrypt from 'bcryptjs';
import { Employee } from '../../models/Modules/Employee.js';
import { LeaveRequest } from '../../models/Modules/LeaveRequest.js';

// --- Salary Records ---
export const getSalaryRecords = async (req, res) => {
    try {
        const { companyId } = req.query;
        if (!companyId) return res.status(400).json({ message: 'Company ID is required' });

        const records = await SalaryRecord.find({ companyId })
            .populate('employeeId', 'firstName lastName position')
            .sort({ paymentDate: -1 });

        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Broadcasts ---

export const createBroadcastGroup = async (req, res) => {
    try {
        const { companyId, name, memberIds } = req.body;
        const newGroup = new BroadcastGroup({
            companyId,
            name,
            members: memberIds
        });
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBroadcastGroups = async (req, res) => {
    try {
        const { companyId } = req.query;
        const groups = await BroadcastGroup.find({ companyId }).populate('members', 'firstName lastName');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBroadcastGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, members } = req.body;

        const group = await BroadcastGroup.findByIdAndUpdate(
            id,
            { name, members },
            { new: true }
        ).populate('members', 'firstName lastName');

        if (!group) return res.status(404).json({ message: 'Group not found' });

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteBroadcastGroup = async (req, res) => {
    try {
        const { id } = req.params;
        await BroadcastGroup.findByIdAndDelete(id);
        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendBroadcastMessage = async (req, res) => {
    try {
        const { companyId, senderId, groupId, targetAll, content, attachments } = req.body;

        const message = new BroadcastMessage({
            companyId,
            senderId, // User ID of Admin
            groupId: targetAll ? null : groupId,
            targetAll,
            content,
            attachments
        });

        await message.save();
        res.status(201).json(message);
    } catch (error) {
        console.error("Error sending broadcast:", error);
        res.status(500).json({ message: error.message });
    }
};
// Get all employees
export const getEmployees = async (req, res) => {
    try {
        const { companyId } = req.query;
        if (!companyId) return res.status(400).json({ message: 'Company ID is required' });

        const employees = await Employee.find({ companyId, isDeleted: false }).sort({ createdAt: -1 });
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single employee
export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee || employee.isDeleted) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create employee
export const createEmployee = async (req, res) => {
    try {
        console.log("Create Employee Request Body:", req.body);
        const {
            companyId, firstName, lastName, email, phone, password,
            position, department, salary, status, dateHired, category, avatar,
            freeLeavesPerMonth, workingDaysPerWeek
        } = req.body;

        if (!companyId || !firstName || !lastName || !email || !phone || !password) {
            return res.status(400).json({ message: 'Company ID, Name, Email, Phone, and Password are required' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newEmployee = new Employee({
            companyId,
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            position,
            department,
            salary,
            status,
            dateHired,
            category: category || 'General',
            avatar,
            freeLeavesPerMonth: freeLeavesPerMonth !== undefined ? freeLeavesPerMonth : 1,
            workingDaysPerWeek: workingDaysPerWeek || 6
        });
        await newEmployee.save();
        res.status(201).json(newEmployee);
    } catch (error) {
        console.error("Create Employee Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update employee
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        // Hash password if it is being updated
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const currentEmployee = await Employee.findById(id);
        if (!currentEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Check if salary is being updated and is different
        if (updates.salary && Number(updates.salary) !== currentEmployee.salary) {
            updates.$push = {
                salaryHistory: {
                    amount: currentEmployee.salary,
                    changeDate: new Date()
                }
            };
        }

        const employee = await Employee.findByIdAndUpdate(id, updates, { new: true });

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the employee first to get current data
        const employeeToDelete = await Employee.findById(id);
        if (!employeeToDelete) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Mangle email and phone to allow reuse
        const timestamp = Date.now();
        const mangledEmail = `${employeeToDelete.email}-deleted-${timestamp}`;
        const mangledPhone = `${employeeToDelete.phone}-deleted-${timestamp}`;

        const employee = await Employee.findByIdAndUpdate(
            id,
            {
                isDeleted: true,
                email: mangledEmail,
                phone: mangledPhone,
                status: 'Terminated'
            },
            { new: true }
        );

        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Pay Salary with Leave Deduction
export const paySalary = async (req, res) => {
    try {
        const { id } = req.params; // Employee ID
        const { amount, payPeriod, paymentDate, remarks, companyId } = req.body;

        // amount here might be the user-edited amount, OR we calculate it.
        // BUT logic demands we calculate deduction.
        // Let's assume the frontend sends the *final* calculated amount,
        // OR we recalculate it here for safety.
        // Better: We accept the final amount, but we also calc deduction to store record.

        // Actually, let's fetch APPROVED leaves for this month to store in record.
        // We'll rely on frontend or a separate "Calculate" step?
        // Let's do calculation here if "calculate: true" is passed?
        // Simpler: Just store what is sent. Frontend handles calculation display.
        // BUT the prompt says "selary count according this".
        // Let's implement the calculation logic here too.

        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        // Let's extract month/year from payPeriod (e.g., "October 2023")
        // This is tricky without strict format. Let's assume frontend passes breakdown?
        // If not, we trust the `amount` passed as Final.

        const { baseSalary, leavesTaken, freeLeaves, deductionAmount } = req.body;

        // 1. Create Salary Record
        const salaryRecord = new SalaryRecord({
            companyId,
            employeeId: id,
            amount: amount, // Final Paid Amount
            baseSalary: baseSalary || employee.salary,
            leavesTaken: leavesTaken || 0,
            freeLeaves: freeLeaves || employee.freeLeavesPerMonth,
            deductionAmount: deductionAmount || 0,
            paymentDate,
            payPeriod,
            remarks,
            status: 'Paid'
        });
        await salaryRecord.save();

        // 2. Create Expense
        const expense = new Expense({
            companyId,
            category: 'Payroll',
            amount: amount,
            date: paymentDate,
            description: `Salary Payment for ${employee.firstName} ${employee.lastName} - ${payPeriod}`,
            paymentMethod: 'Bank Transfer'
        });
        await expense.save();

        res.status(200).json({ message: 'Salary paid and expense recorded', salaryRecord });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Calculate Salary Endpoint (Helper for Frontend)
export const calculateSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const { month, year } = req.query; // e.g. 10, 2023

        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of month

        // Fetch Approved Leaves
        const leaves = await LeaveRequest.find({
            employeeId: id,
            status: 'Approved',
            startDate: { $gte: startDate },
            endDate: { $lte: endDate }
        });

        // Calculate total leave days
        let totalLeaves = 0;
        leaves.forEach(leave => {
            const start = new Date(Math.max(leave.startDate, startDate));
            const end = new Date(Math.min(leave.endDate, endDate));
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            totalLeaves += diffDays;
        });

        const freeLeaves = employee.freeLeavesPerMonth !== undefined ? employee.freeLeavesPerMonth : 1;
        const chargeableLeaves = Math.max(0, totalLeaves - freeLeaves);

        // Calculate Daily Salary based on Working Days
        // 5 Days/Week -> ~22 Days/Month
        // 6 Days/Week -> ~26 Days/Month (Standard)
        // 4 Days/Week -> ~18 Days/Month
        // 7 Days/Week -> 30 Days/Month

        const workingDaysPerWeek = employee.workingDaysPerWeek || 6;
        let avgWorkingDays = 26; // Default to 6 days/week
        if (workingDaysPerWeek === 5) avgWorkingDays = 22;
        else if (workingDaysPerWeek === 4) avgWorkingDays = 18;
        else if (workingDaysPerWeek === 7) avgWorkingDays = 30;
        else avgWorkingDays = workingDaysPerWeek * 4.33; // Fallback

        const dailySalary = (employee.salary / 12) / avgWorkingDays;
        const deduction = Math.round(chargeableLeaves * dailySalary);
        const finalSalary = Math.round((employee.salary / 12) - deduction);

        res.json({
            baseSalary: Math.round(employee.salary / 12),
            totalLeaves,
            freeLeaves,
            chargeableLeaves,
            workingDaysUsed: avgWorkingDays,
            deduction,
            finalSalary
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// --- Admin Leave Management ---
export const getLeaveRequests = async (req, res) => {
    try {
        const { companyId } = req.query;
        console.log(`DEBUG: getLeaveRequests called with companyId: ${companyId}`);

        if (!companyId) return res.status(400).json({ message: 'Company ID is required' });

        const leaves = await LeaveRequest.find({ companyId })
            .populate('employeeId', 'firstName lastName position')
            .sort({ createdAt: -1 });

        console.log(`DEBUG: Found ${leaves.length} leaves.`);

        res.status(200).json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remark } = req.body; // 'Approved' or 'Rejected'

        const leave = await LeaveRequest.findByIdAndUpdate(
            id,
            { status, adminRemark: remark },
            { new: true }
        );

        if (!leave) return res.status(404).json({ message: 'Leave request not found' });

        res.status(200).json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
