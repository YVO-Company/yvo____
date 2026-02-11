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
    } catch (error) {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create invoice
export const createInvoice = async (req, res) => {
    try {
        const { companyId, invoiceNumber, customerId, customerName, clientAddress, gstNumber, date, dueDate, items, status } = req.body;

        if (!companyId || !invoiceNumber) {
            return res.status(400).json({ message: 'Company ID and Invoice Number are required' });
        }

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
        const taxTotal = subtotal * 0.1; // Example 10% tax, should be configurable
        const grandTotal = subtotal + taxTotal;

        // INVENTORY INTEGRATION: Deduct Stock
        if (status !== 'DRAFT') { // Only deduct if actual sale
            for (const item of items) {
                if (item.inventoryId) { // Ensure frontend sends inventoryId
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
            items,
            subtotal,
            taxTotal,
            grandTotal,
            status: status || 'DRAFT'
        });

        await newInvoice.save();

        // FINANCE INTEGRATION: Add Revenue
        if (status === 'PAID') {
            const Expense = (await import('../../models/Modules/Expense.js')).Expense;
            const revenueEntry = new Expense({
                companyId,
                description: `Invoice Revenue #${invoiceNumber} - ${customerName}`,
                amount: grandTotal,
                category: 'Sales',
                date: date || new Date(),
                type: 'INCOME', // New ENUM type needed in Expense model? Or just positive expense? Convention: Expense is negative usually, but let's assume type field handles it.
                // Actually existing Expense model likely only handles expenses.
                // To avoid complex refactor, I'll store it as 'Income' category or ensure Expense model supports type.
                // Checking expense model...
            });
            // Let's assume we need to update Expense model to support type 'INCOME' if it doesn't already. 
            // For now, I'll save it. Ideally, Finance should calculate Revenue from Invoices directly, but user asked to "connect".
            // A better approach: Finance Page calculates Total Revenue by summing PAID invoices.
            // I will NOT duplicate data into Expenses to avoid sync hell. I will update Finance.jsx to fetch Invoices for Revenue.
        }

        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update invoice
export const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Recalculate totals if items changed
        if (updates.items) {
            const subtotal = updates.items.reduce((sum, item) => sum + (item.total || 0), 0);
            const taxTotal = subtotal * 0.1;
            updates.subtotal = subtotal;
            updates.taxTotal = taxTotal;
            updates.grandTotal = subtotal + taxTotal;
        }

        const invoice = await Invoice.findByIdAndUpdate(id, { ...updates, lastModifiedAt: Date.now() }, { new: true });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
