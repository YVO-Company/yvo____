import { Request, Response } from 'express';
import { InvoiceTemplate } from '../models/Modules/InvoiceTemplate.js';
import { Company } from '../models/Global/Company.js';

export const getTemplates = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.query;
        const query: any = {
            isDeleted: false,
            $or: [
                { type: 'GLOBAL' }
            ]
        };

        if (companyId) {
            query.$or.push({ type: 'COMPANY', companyId });
        }

        const templates = await InvoiceTemplate.find(query).sort({ createdAt: -1 });
        res.status(200).json(templates);
    } catch (err: any) {
        console.error("Error fetching templates:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getAllTemplatesAdmin = async (req: Request, res: Response) => {
    try {
        const templates = await InvoiceTemplate.find({ isDeleted: false })
            .populate('companyId', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(templates);
    } catch (err: any) {
        console.error("Error fetching all templates for admin:", err);
        res.status(500).json({ message: "Server error" });
    }
};
export const getTemplateById = async (req: Request, res: Response) => {
    try {
        const template = await InvoiceTemplate.findById(req.params.id);
        if (!template || template.isDeleted) {
            return res.status(404).json({ message: "Template not found" });
        }
        res.status(200).json(template);
    } catch (err: any) {
        console.error("Error fetching template:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const createTemplate = async (req: Request, res: Response) => {
    try {
        const { companyId, name, type, themeIdentifier, items, taxRate, notes, layout } = req.body;

        const template = new InvoiceTemplate({
            companyId,
            name,
            type: type || 'COMPANY',
            themeIdentifier: themeIdentifier || 'classic',
            items: items || [],
            taxRate: taxRate !== undefined ? taxRate : 10,
            notes: notes || '',
            layout: layout || []
        });

        await template.save();
        res.status(201).json(template);
    } catch (err: any) {
        console.error("Error creating template:", err);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map((e: any) => e.message);
            console.error("Mongoose Validation Errors:", errors);
            return res.status(400).json({ message: "Validation Error", errors });
        }
        res.status(500).json({ message: err.message || "Server error" });
    }
};

export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const template = await InvoiceTemplate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }
        res.status(200).json(template);
    } catch (err: any) {
        console.error("Error updating template:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const template = await InvoiceTemplate.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );
        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }
        res.status(200).json({ message: "Template deleted" });
    } catch (err: any) {
        console.error("Error deleting template:", err);
        res.status(500).json({ message: "Server error" });
    }
};
