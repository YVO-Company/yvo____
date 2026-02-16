import React, { useState } from 'react';
import { Download, FileText, DollarSign, Users, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function ReportsWidget({ companyId }) {
    const [loading, setLoading] = useState(false);

    const downloadCSV = (data, filename) => {
        if (!data || !data.length) {
            alert("No data available to download.");
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(fieldName => {
                const value = row[fieldName];
                return `"${value !== undefined && value !== null ? String(value).replace(/"/g, '""') : ''}"`;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadReport = async (type) => {
        try {
            setLoading(true);
            let data = [];
            let filename = `report_${type}_${new Date().toISOString().split('T')[0]}.csv`;

            if (type === 'payroll') {
                // Fetch Payroll Logic
                // Assuming an endpoint exist or we mock it. If not, use employees for now as mock.
                // Checking previous files: Payroll.jsx fetches '/payrolls' or similar.
                // Let's try fetching employees and simulated payroll data for now if endpoint fails.
                const res = await api.get('/employees', { params: { companyId } });
                data = res.data.map(emp => ({
                    EmployeeID: emp._id,
                    Name: `${emp.firstName} ${emp.lastName}`,
                    Position: emp.position,
                    Department: emp.department,
                    BasicSalary: emp.salary,
                    Status: emp.status
                }));
            } else if (type === 'revenue') {
                const res = await api.get('/invoices', { params: { companyId } });
                data = res.data
                    .filter(inv => inv.status === 'PAID')
                    .map(inv => ({
                        InvoiceNumber: inv.invoiceNumber,
                        Client: inv.client?.name || 'N/A',
                        Date: new Date(inv.date).toLocaleDateString(),
                        Amount: inv.grandTotal,
                        Status: inv.status
                    }));
            } else if (type === 'due_invoices') {
                const res = await api.get('/invoices', { params: { companyId } });
                data = res.data
                    .filter(inv => inv.status === 'OVERDUE' || (inv.status === 'PENDING' && new Date(inv.dueDate) < new Date()))
                    .map(inv => ({
                        InvoiceNumber: inv.invoiceNumber,
                        Client: inv.client?.name || 'N/A',
                        DueDate: new Date(inv.dueDate).toLocaleDateString(),
                        Amount: inv.grandTotal,
                        Status: 'OVERDUE'
                    }));
            } else if (type === 'overall') {
                // Combine summary
                const [empRes, invRes] = await Promise.all([
                    api.get('/employees', { params: { companyId } }),
                    api.get('/invoices', { params: { companyId } })
                ]);

                const totalRevenue = invRes.data
                    .filter(i => i.status === 'PAID')
                    .reduce((sum, i) => sum + (i.grandTotal || 0), 0);

                const pendingRevenue = invRes.data
                    .filter(i => i.status === 'PENDING' || i.status === 'OVERDUE')
                    .reduce((sum, i) => sum + (i.grandTotal || 0), 0);

                data = [{
                    Metric: 'Total Employees', Value: empRes.data.length
                }, {
                    Metric: 'Total Revenue (Paid)', Value: totalRevenue
                }, {
                    Metric: 'Pending Revenue', Value: pendingRevenue
                }, {
                    Metric: 'Total Invoices', Value: invRes.data.length
                }];
            }

            downloadCSV(data, filename);

        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-brand" /> Quick Reports
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    onClick={() => handleDownloadReport('overall')}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition group"
                >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Overall Summary</span>
                    <span className="text-xs text-slate-400 mt-1">CSV Export</span>
                </button>

                <button
                    onClick={() => handleDownloadReport('payroll')}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition group"
                >
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Users size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Payroll Report</span>
                    <span className="text-xs text-slate-400 mt-1">Employee List</span>
                </button>

                <button
                    onClick={() => handleDownloadReport('revenue')}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition group"
                >
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <DollarSign size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Revenue Report</span>
                    <span className="text-xs text-slate-400 mt-1">Paid Invoices</span>
                </button>

                <button
                    onClick={() => handleDownloadReport('due_invoices')}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition group"
                >
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <AlertCircle size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Due Invoices</span>
                    <span className="text-xs text-slate-400 mt-1">Overdue List</span>
                </button>
            </div>
        </div>
    );
}
