import { Request, Response } from 'express';
import { ClientLogo } from '../../models/Global/ClientLogo.js';

// Get all clients (Public)
export const getClients = async (req: Request, res: Response) => {
    try {
        const clients = await ClientLogo.find().sort({ createdAt: -1 });
        res.status(200).json(clients);
    } catch (error: any) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Failed to fetch clients' });
    }
};

// Add a new client (Super Admin)
export const addClient = async (req: Request, res: Response) => {
    try {
        const { name, logoUrl } = req.body;

        if (!name || !logoUrl) {
            return res.status(400).json({ message: 'Name and Logo URL are required' });
        }

        const newClient = new ClientLogo({ name, logoUrl });
        await newClient.save();

        res.status(201).json(newClient);
    } catch (error: any) {
        console.error('Error adding client:', error);
        res.status(500).json({ message: 'Failed to add client' });
    }
};

// Delete a client (Super Admin)
export const deleteClient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ClientLogo.findByIdAndDelete(id);
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Failed to delete client' });
    }
};
