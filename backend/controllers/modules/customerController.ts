import { Request, Response } from 'express';
import { Customer } from '../../models/Modules/Customer.js';
import mongoose from 'mongoose';

// Get all customers for a company
export const getCustomers = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.query; // Or from auth middleware if available like req.user.companyId

        if (!companyId) {
            return res.status(400).json({ message: 'Company ID is required' });
        }

        const companyObjectId = new mongoose.Types.ObjectId(companyId as string);

        const customers = await Customer.aggregate([
            { $match: { companyId: companyObjectId, isDeleted: false } },
            // Lookup Invoices
            {
                $lookup: {
                    from: 'invoices',
                    let: { customerId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$customerId', '$$customerId'] }, isDeleted: false, status: { $nin: ['DRAFT', 'CANCELLED'] } } }
                    ],
                    as: 'invoices'
                }
            },
            // Lookup Payments
            {
                $lookup: {
                    from: 'payments', // The collection name for Payment model
                    let: { customerId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$customerId', '$$customerId'] }, isDeleted: false } }
                    ],
                    as: 'payments'
                }
            },
            // Add fields
            {
                $addFields: {
                    totalInvoiced: { $sum: '$invoices.grandTotal' },
                    totalReceived: { $sum: '$payments.amount' }
                }
            },
            {
                $addFields: {
                    totalDue: { $subtract: ['$totalInvoiced', '$totalReceived'] }
                }
            },
            {
                $project: {
                    invoices: 0,
                    payments: 0
                }
            },
            { $sort: { lastModifiedAt: -1 } }
        ]);

        res.status(200).json(customers);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get single customer
export const getCustomerById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findById(id);

        if (!customer || customer.isDeleted) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json(customer);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get single customer ledger (customer + invoices + payments + totals)
export const getCustomerLedger = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const customerObjectId = new mongoose.Types.ObjectId(id as string);

        const result = await Customer.aggregate([
            { $match: { _id: customerObjectId, isDeleted: false } },
            {
                $lookup: {
                    from: 'invoices',
                    let: { customerId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$customerId', '$$customerId'] }, isDeleted: false } },
                        { $sort: { date: -1 } }
                    ],
                    as: 'invoices'
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    let: { customerId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$customerId', '$$customerId'] }, isDeleted: false } },
                        { $sort: { date: -1 } }
                    ],
                    as: 'payments'
                }
            },
            {
                $addFields: {
                    totalInvoiced: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$invoices',
                                        as: 'invoice',
                                        cond: { $not: { $in: ['$$invoice.status', ['DRAFT', 'CANCELLED']] } }
                                    }
                                },
                                as: 'filteredInvoice',
                                in: '$$filteredInvoice.grandTotal'
                            }
                        }
                    },
                    totalReceived: { $sum: '$payments.amount' }
                }
            },
            {
                $addFields: {
                    totalDue: { $subtract: ['$totalInvoiced', '$totalReceived'] }
                }
            }
        ]);

        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json(result[0]);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Create customer
export const createCustomer = async (req: Request, res: Response) => {
    try {
        const { companyId, name, email, phone, address, taxId } = req.body;

        if (!companyId || !name) {
            return res.status(400).json({ message: 'Company ID and Name are required' });
        }

        const newCustomer = new Customer({
            companyId,
            name,
            email,
            phone,
            address,
            taxId
        });

        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update customer
export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const customer = await Customer.findByIdAndUpdate(id, { ...updates, lastModifiedAt: Date.now() }, { new: true });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json(customer);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Delete (Soft delete) customer
export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findByIdAndUpdate(id, { isDeleted: true, lastModifiedAt: Date.now() }, { new: true });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
