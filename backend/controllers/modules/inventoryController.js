import { InventoryItem } from '../../models/Modules/InventoryItem.js';

// Get all inventory items
export const getInventory = async (req, res) => {
    try {
        const { companyId } = req.query;

        if (!companyId) {
            return res.status(400).json({ message: 'Company ID is required' });
        }

        const items = await InventoryItem.find({ companyId, isDeleted: false });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single item
export const getInventoryItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await InventoryItem.findById(id);

        if (!item || item.isDeleted) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create item
export const createInventoryItem = async (req, res) => {
    try {
        const { companyId, sku, name, description, quantityOnHand, reorderLevel, costPrice, sellingPrice, category } = req.body;

        if (!companyId || !sku || !name) {
            return res.status(400).json({ message: 'Company ID, SKU, and Name are required' });
        }

        const newItem = new InventoryItem({
            companyId,
            sku,
            name,
            description,
            quantityOnHand,
            reorderLevel,
            costPrice,
            sellingPrice,
            category
        });

        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update item
export const updateInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const item = await InventoryItem.findByIdAndUpdate(id, { ...updates, lastModifiedAt: Date.now() }, { new: true });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete item
export const deleteInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await InventoryItem.findByIdAndUpdate(id, { isDeleted: true, lastModifiedAt: Date.now() }, { new: true });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
