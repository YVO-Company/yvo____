import { Company } from '../models/Global/Company.js';
import { Invoice } from '../models/Modules/Invoice.js';

// POST /sync/push
// Desktop app pushes local changes
export const pushChanges = async (req, res) => {
    try {
        const { changes, deviceId } = req.body; // changes = [{ table: 'invoices', data: {...}, op: 'INSERT'|'UPDATE' }]
        const companyId = req.headers['x-company-id'];

        if (!changes || !Array.isArray(changes)) {
            return res.status(400).json({ message: 'Invalid changes format' });
        }

        const results = [];

        // Simple "Last Write Wins" processing
        for (const change of changes) {
            if (change.table === 'invoices') {
                if (change.op === 'INSERT' || change.op === 'UPDATE') {
                    // Upsert based on invoiceNumber or ID
                    const filter = change.data._id ? { _id: change.data._id } : { invoiceNumber: change.data.invoiceNumber, companyId };

                    await Invoice.findOneAndUpdate(
                        filter,
                        { ...change.data, companyId, lastModifiedAt: new Date() },
                        { upsert: true, new: true }
                    );
                    results.push({ id: change.data._id || change.data.invoiceNumber, status: 'synced' });
                }
            }
            // Add other tables (Inventory, Customers) handling here
        }

        res.json({ status: 'success', results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /sync/pull
// Desktop app polls for changes since last checkpoint
export const pullChanges = async (req, res) => {
    try {
        const companyId = req.headers['x-company-id'];
        const { since } = req.query; // ISO Date string

        const query = { companyId };
        if (since) {
            query.lastModifiedAt = { $gt: new Date(since) };
        }

        const invoices = await Invoice.find(query);
        // const inventory = await InventoryItem.find(query);

        res.json({
            changes: {
                invoices,
                // inventory
            },
            checkpoint: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
