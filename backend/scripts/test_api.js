import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const runTests = async () => {
    try {
        console.log('--- Starting API Verification ---');

        // 1. Register Company
        console.log('1. Registering Company...');
        const uniqueId = Date.now();
        const registerRes = await axios.post(`${API_URL}/auth/register-company`, {
            companyName: `Test Corp ${uniqueId}`,
            ownerName: 'Test Owner',
            email: `owner${uniqueId}@test.com`,
            password: 'password123'
        });

        if (registerRes.status === 201) {
            console.log('✅ Company Registered');
        } else {
            throw new Error('Registration failed');
        }

        const { token, companyId } = registerRes.data;
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: {
                companyId
            }
        };

        // 2. Fetch Inventory (Should be empty)
        console.log('2. Fetching Inventory...');
        const invRes = await axios.get(`${API_URL}/inventory`, config);
        if (Array.isArray(invRes.data) && invRes.data.length === 0) {
            console.log('✅ Inventory Fetch (Empty) Success');
        } else {
            console.error('Inventory Fetch Failed or not empty', invRes.data);
        }

        // 3. Create Inventory Item
        console.log('3. Creating Inventory Item...');
        const itemRes = await axios.post(`${API_URL}/inventory`, {
            companyId, // Explicitly sending though query param also there just in case controller needs body
            sku: `SKU-${uniqueId}`,
            name: 'Test Item',
            description: 'A test item',
            quantityOnHand: 100,
            sellingPrice: 50,
            category: 'Testing'
        }, config);

        if (itemRes.status === 201) {
            console.log('✅ Inventory Item Created');
        }

        // 4. Fetch Inventory Again (Should have 1 item)
        console.log('4. Fetching Inventory (expect 1)...');
        const invRes2 = await axios.get(`${API_URL}/inventory`, config);
        if (invRes2.data.length === 1 && invRes2.data[0].name === 'Test Item') {
            console.log('✅ Inventory Fetch (1 Item) Success');
        } else {
            console.error('Inventory Fetch Validation Failed', invRes2.data);
        }

        // 5. Fetch Finance (Empty)
        console.log('5. Fetching Invoices...');
        const invcRes = await axios.get(`${API_URL}/invoices`, config);
        if (Array.isArray(invcRes.data)) {
            console.log('✅ Invoices Fetch Success');
        }

        console.log('--- API Verification Completed Successfully ---');

    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
};

runTests();
