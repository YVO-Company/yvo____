import { Invoice } from '../../models/Modules/Invoice.js';
// Get all invoices
export const getInvoices = async (req, res) => {
    try {
        const { companyId, isDeleted } = req.query;
        if (!companyId) {
            return res.status(400).json({ message: 'Company ID is required' });
        }
        const filter = {
            companyId,
            isDeleted: isDeleted === 'true' // Convert string 'true' to boolean true, else false
        };
        const invoices = await Invoice.find(filter).sort({ date: -1 });
        res.status(200).json(invoices);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get single invoice
export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findById(id).populate('customerId', 'name email');
        if (!invoice || invoice.isDeleted) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.status(200).json(invoice);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Create invoice
export const createInvoice = async (req, res) => {
    try {
        const { companyId, invoiceNumber, customerId, customerName, clientAddress, gstNumber, date, dueDate, items, status, templateId, layout, taxRate: providedTaxRate } = req.body;
        if (!companyId || !invoiceNumber) {
            return res.status(400).json({ message: 'Company ID and Invoice Number are required' });
        }
        // Use tax rate from request or default to 10
        const taxRate = providedTaxRate !== undefined ? providedTaxRate : 10;
        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
        const taxTotal = subtotal * (taxRate / 100);
        const grandTotal = subtotal + taxTotal;
        // INVENTORY INTEGRATION & CLEANSING
        const cleansedItems = (items || []).map((item) => {
            const newItem = { ...item };
            if (newItem.inventoryId === "" || newItem.inventoryId === null) {
                delete newItem.inventoryId;
            }
            return newItem;
        });
        if (status !== 'DRAFT') { // Only deduct if actual sale
            for (const item of cleansedItems) {
                if (item.inventoryId) {
                    const inventoryItem = await (await import('../../models/Modules/InventoryItem.js')).InventoryItem.findById(item.inventoryId);
                    if (inventoryItem) {
                        if (inventoryItem.quantityOnHand < item.quantity) {
                            return res.status(400).json({ message: `Insufficient stock for ${item.description}` });
                        }
                        inventoryItem.quantityOnHand -= item.quantity;
                        await inventoryItem.save();
                    }
                }
            }
        }
        const newInvoice = new Invoice({
            companyId,
            invoiceNumber,
            customerId,
            customerName,
            clientAddress,
            gstNumber,
            date,
            dueDate,
            items: cleansedItems,
            subtotal,
            taxTotal,
            grandTotal,
            status: status || 'DRAFT',
            templateId,
            layout: layout || [],
            taxRate
        });
        await newInvoice.save();
        res.status(201).json(newInvoice);
    }
    catch (error) {
        console.error("CRITICAL ERROR IN CREATE INVOICE:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
// Update invoice
export const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Recalculate totals if items or taxRate changed
        if (updates.items || updates.taxRate !== undefined) {
            const taxRate = updates.taxRate !== undefined ? updates.taxRate : 10;
            // Cleanse items
            const cleansedItems = (updates.items || []).map((item) => {
                const newItem = { ...item };
                if (newItem.inventoryId === "" || newItem.inventoryId === null) {
                    delete newItem.inventoryId;
                }
                return newItem;
            });
            const subtotal = cleansedItems.reduce((sum, item) => sum + (item.total || 0), 0);
            const taxTotal = subtotal * (taxRate / 100);
            updates.items = cleansedItems;
            updates.subtotal = subtotal;
            updates.taxTotal = taxTotal;
            updates.grandTotal = subtotal + taxTotal;
            updates.taxRate = taxRate;
        }
        const invoice = await Invoice.findByIdAndUpdate(id, { ...updates, lastModifiedAt: Date.now() }, { new: true });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.status(200).json(invoice);
    }
    catch (error) {
        console.error("CRITICAL ERROR IN UPDATE INVOICE:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};
// Delete invoice
export const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findByIdAndUpdate(id, { isDeleted: true, lastModifiedAt: Date.now() }, { new: true });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.status(200).json({ message: 'Invoice deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
