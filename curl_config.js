import axios from 'axios';

const testConfig = async () => {
    try {
        // We need a valid company ID for this to work.
        // Let's hardcode the one we saw earlier in the logs or fetch it via DB.
        // Since I can't easily get the ID without DB access, I'll update this script to fetch it first.

        // Wait, I can just use the login endpoint to get the token and companyId!
        const loginRes = await axios.post('http://localhost:4000/api/auth/login', {
            email: 'user@company.com',
            password: 'password123'
        });

        const { token, currentCompanyId } = loginRes.data;
        console.log('Got Company ID:', currentCompanyId);

        const configRes = await axios.get('http://localhost:4000/api/company/config', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-company-id': currentCompanyId
            }
        });

        console.log('Config Response:', JSON.stringify(configRes.data, null, 2));

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
};

testConfig();
