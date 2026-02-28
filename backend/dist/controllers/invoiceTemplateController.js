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
export const getAllTemplatesAdmin = async (req, res) => {
    try {
        const templates = await InvoiceTemplate.find({ isDeleted: false })
            .populate('companyId', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(templates);
    }
    catch (err) {
        console.error("Error fetching all templates for admin:", err);
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
        // Cleanse items
        const cleansedItems = (items || []).map((item) => {
            const newItem = { ...item };
            if (newItem.inventoryId === "" || newItem.inventoryId === null) {
                delete newItem.inventoryId;
            }
            newItem.quantity = parseFloat(item.quantity) || 0;
            newItem.price = parseFloat(item.price) || 0;
            newItem.total = parseFloat(item.total) || 0;
            return newItem;
        });
        const template = new InvoiceTemplate({
            companyId,
            name,
            type: type || 'COMPANY',
            themeIdentifier: themeIdentifier || 'classic',
            items: cleansedItems,
            taxRate: parseFloat(taxRate) !== undefined ? parseFloat(taxRate) : 10,
            notes: notes || '',
            layout: layout || []
        });
        await template.save();
        res.status(201).json(template);
    }
    catch (err) {
        console.error("Error creating template:", err);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map((e) => e.message);
            console.error("Mongoose Validation Errors:", errors);
            return res.status(400).json({ message: "Validation Error", errors });
        }
        res.status(500).json({ message: err.message || "Server error" });
    }
};
export const updateTemplate = async (req, res) => {
    try {
        const id = req.params.id;
        const updates = { ...req.body };
        if (updates.items) {
            updates.items = updates.items.map((item) => {
                const newItem = { ...item };
                if (newItem.inventoryId === "" || newItem.inventoryId === null) {
                    delete newItem.inventoryId;
                }
                newItem.quantity = parseFloat(item.quantity) || 0;
                newItem.price = parseFloat(item.price) || 0;
                newItem.total = parseFloat(item.total) || 0;
                return newItem;
            });
        }
        if (updates.taxRate !== undefined) {
            updates.taxRate = parseFloat(updates.taxRate) || 0;
        }
        const template = await InvoiceTemplate.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
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
