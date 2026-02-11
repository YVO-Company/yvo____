import { signToken } from '../src/utils/jwt.js';
import bcrypt from 'bcryptjs';
import { Employee } from '../models/Modules/Employee.js';
import { Company } from '../models/Global/Company.js';

export const loginEmployee = async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Find employee by phone
        const employee = await Employee.findOne({ phone }).populate('companyId', 'name logo');
        if (!employee) {
            return res.status(401).json({ message: 'Invalid phone or password' });
        }

        // Check password
        if (!employee.password) {
            return res.status(400).json({ message: 'Account not fully set up. Please contact admin.' });
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid phone or password' });
        }

        if (employee.status !== 'Active') {
            return res.status(403).json({ message: 'Account is not active' });
        }

        // Check if Company has Employee Module Enabled
        const Company = (await import('../models/Global/Company.js')).Company;
        const Plan = (await import('../models/Global/Plan.js')).Plan;
        const company = await Company.findById(employee.companyId._id).populate('planId');

        // Calculate functionality access
        const plan = await Plan.findById(company.planId._id || company.planId);
        const planDefaults = plan.defaultFlags ? Object.fromEntries(plan.defaultFlags) : {};
        const companyOverrides = company.featureFlags ? Object.fromEntries(company.featureFlags) : {};

        // Merge logic: Plan Defaults -> Company Overrides
        // We need to check 'module_employees'
        const effectiveFlags = { ...planDefaults, ...companyOverrides };

        if (!effectiveFlags['module_employees']) {
            return res.status(403).json({ message: 'Employee access is disabled for your company.' });
        }

        // Generate Token
        const token = signToken(
            { id: employee._id, role: 'employee', companyId: employee.companyId._id }
        );

        res.json({
            token,
            user: {
                id: employee._id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                phone: employee.phone,
                position: employee.position,
                department: employee.department,
                company: employee.companyId,
                avatar: employee.avatar,
                role: 'employee'
            }
        });

    } catch (error) {
        console.error('Employee Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getEmployeeProfile = async (req, res) => {
    try {
        const employeeId = req.user.id; // From middleware
        const employee = await Employee.findById(employeeId).populate('companyId', 'name logo');

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
