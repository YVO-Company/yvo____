import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Download, DollarSign } from 'lucide-react';

export default function EmployeeSalary() {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSalaries = async () => {
            try {
                const res = await api.get('/employee/dashboard/salary');
                setSalaries(res.data);
            } catch (error) {
                console.error("Error fetching salaries", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSalaries();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Salary History</h1>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dash-table-container">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Pay Period</th>
                            <th className="px-6 py-3 font-semibold">Payment Date</th>
                            <th className="px-6 py-3 font-semibold">Amount</th>
                            <th className="px-6 py-3 font-semibold">Status</th>
                            <th className="px-6 py-3 font-semibold">Slip</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {salaries.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                    No salary records found.
                                </td>
                            </tr>
                        ) : (
                            salaries.map((salary) => (
                                <tr key={salary._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{salary.payPeriod}</td>
                                    <td className="px-6 py-4">{new Date(salary.paymentDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-semibold text-emerald-600">₹{salary.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                            ${salary.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                salary.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-slate-100 text-slate-800'}`}>
                                            {salary.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {salary.slipUrl ? (
                                            <a href={salary.slipUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                <Download size={16} /> Download
                                            </a>
                                        ) : (
                                            <span className="text-slate-400">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
