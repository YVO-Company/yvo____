// Native fetch implementation to avoid dependency issues
const runTest = async () => {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'user@company.com',
                password: 'password123'
            })
        });

        if (!loginRes.ok) {
            const err = await loginRes.text();
            throw new Error(`Login failed: ${loginRes.status} ${err}`);
        }

        const loginData = await loginRes.json();
        const { token, currentCompanyId } = loginData;

        console.log('Login successful.');
        console.log('Company ID:', currentCompanyId);

        console.log('2. Fetching Config...');
        const configRes = await fetch('http://localhost:4000/api/company/config', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-company-id': currentCompanyId
            }
        });

        if (!configRes.ok) {
            const err = await configRes.text();
            throw new Error(`Config fetch failed: ${configRes.status} ${err}`);
        }

        const configData = await configRes.json();
        console.log('------------------------------------------------');
        console.log('MODULES CONFIGURATION:');
        console.log(JSON.stringify(configData.modules, null, 2));
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('TEST FAILED:', error.message);
    }
};

runTest();
