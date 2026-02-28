import { Request, Response } from 'express';
import { Payment } from '../../models/Modules/Payment.js';

export const getPayments = async (req: Request, res: Response) => {
    try {
        const { companyId, customerId } = req.query;
        if (!companyId) return res.status(400).json({ message: 'Company ID required' });

        const filter: any = { companyId, isDeleted: false };
        if (customerId) filter.customerId = customerId;

        const payments = await Payment.find(filter).populate('customerId', 'name').sort({ date: -1 });
        res.status(200).json(payments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createPayment = async (req: Request, res: Response) => {
    try {
        const { companyId, customerId, amount, date, method, invoiceAllocation } = req.body;
        if (!companyId || !customerId || amount === undefined) {
            return res.status(400).json({ message: 'Company, Customer, and Amount required' });
        }

        const newPayment = new Payment({ companyId, customerId, amount, date, method, invoiceAllocation });
        await newPayment.save();
        res.status(201).json(newPayment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePayment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const payment = await Payment.findByIdAndUpdate(id, updates, { new: true });
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        res.status(200).json(payment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePayment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        res.status(200).json({ message: 'Payment deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
