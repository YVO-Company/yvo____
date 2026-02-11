const COMPANY_ID = '69873a5a1d893c740340fcba';
const API_URL = 'http://localhost:4000/api/employees';

// Helper to generate unique email/phone
const uniqueId = Date.now();
const testEmail = `test.employee.${uniqueId}@example.com`;
const testPhone = `+1${uniqueId}`; // Example phone format

async function runTest() {
    try {
        console.log(`Starting verification test with email: ${testEmail}`);

        // 1. Create Employee
        console.log('1. Creating Employee...');
        const createRes = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                companyId: COMPANY_ID,
                firstName: 'Test',
                lastName: 'User',
                email: testEmail,
                phone: testPhone,
                password: 'password123',
                position: 'Developer',
                department: 'Engineering',
                salary: 50000,
                status: 'Active',
                dateHired: new Date().toISOString()
            })
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`Failed to create employee: ${createRes.status} ${err}`);
        }
        const createdEmployee = await createRes.json();
        console.log('Employee created successfully:', createdEmployee._id);

        // 2. Delete Employee
        console.log('2. Deleting Employee...');
        const deleteRes = await fetch(`${API_URL}/${createdEmployee._id}`, {
            method: 'DELETE'
        });

        if (!deleteRes.ok) {
            const err = await deleteRes.text();
            throw new Error(`Failed to delete employee: ${deleteRes.status} ${err}`);
        }
        console.log('Employee deleted successfully.');

        // 3. Create Employee Again (Same Email/Phone)
        console.log('3. Re-creating Employee with same credentials...');
        const recreateRes = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                companyId: COMPANY_ID,
                firstName: 'Test',
                lastName: 'User 2',
                email: testEmail, // Same email
                phone: testPhone, // Same phone
                password: 'password123',
                position: 'Developer',
                department: 'Engineering',
                salary: 50000,
                status: 'Active',
                dateHired: new Date().toISOString()
            })
        });

        if (!recreateRes.ok) {
            const err = await recreateRes.text();
            throw new Error(`Failed to re-create employee: ${recreateRes.status} ${err}`);
        }
        const recreatedEmployee = await recreateRes.json();
        console.log('Employee re-created successfully:', recreatedEmployee._id);

        console.log('VERIFICATION SUCCESSFUL: Employee deletion allows re-use of credentials.');

    } catch (error) {
        console.error('VERIFICATION FAILED:', error.message);
        process.exit(1);
    }
}

runTest();
