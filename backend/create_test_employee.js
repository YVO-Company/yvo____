const COMPANY_ID = '69873a5a1d893c740340fcba';
const API_URL = 'http://localhost:4000/api/employees';

async function createEmployee() {
    try {
        const uniqueId = Math.floor(1000 + Math.random() * 9000); // 4 digit random
        const phone = `+91987654${uniqueId}`;
        const email = `demo.employee.${uniqueId}@example.com`;
        const password = 'password123';

        console.log(`Creating employee safely...`);

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                companyId: COMPANY_ID,
                firstName: 'Demo',
                lastName: `User ${uniqueId}`,
                email: email,
                phone: phone,
                password: password,
                position: 'Tester',
                department: 'QA',
                salary: 60000,
                status: 'Active',
                dateHired: new Date().toISOString()
            })
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Failed: ${res.status} ${err}`);
        }

        const data = await res.json();
        console.log('\n=== Employee Created ===');
        console.log(`Name:     ${data.firstName} ${data.lastName}`);
        console.log(`Phone:    ${data.phone}`);
        console.log(`Password: ${password}`);
        console.log(`Email:    ${data.email}`);
        console.log('========================\n');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

createEmployee();
