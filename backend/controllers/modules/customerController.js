import { Customer } from '../../models/Modules/Customer.js';

// Get all customers for a company
export const getCustomers = async (req, res) => {
    try {
        const { companyId } = req.query; // Or from auth middleware if available like req.user.companyId

        if (!companyId) {
            return res.status(400).json({ message: 'Company ID is required' });
        }

        const customers = await Customer.find({ companyId, isDeleted: false });
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single customer
export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findById(id);

        if (!customer || customer.isDeleted) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create customer
export const createCustomer = async (req, res) => {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update customer
export const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const customer = await Customer.findByIdAndUpdate(id, { ...updates, lastModifiedAt: Date.now() }, { new: true });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete (Soft delete) customer
export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findByIdAndUpdate(id, { isDeleted: true, lastModifiedAt: Date.now() }, { new: true });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
