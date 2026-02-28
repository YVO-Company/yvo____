import { InvoiceTemplate } from '../models/Modules/InvoiceTemplate.js';
export const getTemplates = async (req, res) => {
    try {
        const { companyId } = req.query;
        const query = {
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
    }
    catch (err) {
        console.error("Error fetching templates:", err);
        res.status(500).json({ message: "Server error" });
    }
};
export const getTemplateById = async (req, res) => {
    try {
        const template = await InvoiceTemplate.findById(req.params.id);
        if (!template || template.isDeleted) {
            return res.status(404).json({ message: "Template not found" });
        }
        res.status(200).json(template);
    }
    catch (err) {
        console.error("Error fetching template:", err);
        res.status(500).json({ message: "Server error" });
    }
};
export const createTemplate = async (req, res) => {
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
    }
    catch (err) {
        console.error("Error creating template:", err);
        res.status(500).json({ message: "Server error" });
    }
};
export const updateTemplate = async (req, res) => {
    try {
        const template = await InvoiceTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }
        res.status(200).json(template);
    }
    catch (err) {
        console.error("Error updating template:", err);
        res.status(500).json({ message: "Server error" });
    }
};
export const deleteTemplate = async (req, res) => {
    try {
        const template = await InvoiceTemplate.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }
        res.status(200).json({ message: "Template deleted" });
    }
    catch (err) {
        console.error("Error deleting template:", err);
        res.status(500).json({ message: "Server error" });
    }
};
