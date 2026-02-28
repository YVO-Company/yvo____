import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ClientLogo } from '../models/Global/ClientLogo.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yvo');
        console.log('Connected to DB');

        // 1. Add Client
        console.log('Adding client...');
        const client = new ClientLogo({
            name: 'Test Client',
            logoUrl: 'https://via.placeholder.com/150'
        });
        await client.save();
        console.log('Client added:', client._id);

        // 2. Fetch Clients
        console.log('Fetching clients...');
        const clients = await ClientLogo.find();
        console.log(`Found ${clients.length} clients`);
        const found = clients.find(c => c._id.toString() === client._id.toString());
        if (found) console.log('Test client found in list: PASS');
        else console.error('Test client NOT found: FAIL');

        // 3. Delete Client
        console.log('Deleting client...');
        await ClientLogo.findByIdAndDelete(client._id);
        const checks = await ClientLogo.findById(client._id);
        if (!checks) console.log('Client deleted successfully: PASS');
        else console.error('Client still exists: FAIL');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
