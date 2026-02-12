import React, { useState, useEffect } from 'react';
import { Plus, Download, Filter, Calendar as CalIcon, TrendingUp, DollarSign, Receipt, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import html2pdf from 'html2pdf.js';

export default function Finance() {
    const [allExpenses, setAllExpenses] = useState([]);
    const [allInvoices, setAllInvoices] = useState([]);

    // Filtered Data for View
    const [expenses, setExpenses] = useState([]);
    const [stats, setStats] = useState({ revenue: 0, outstanding: 0, expenses: 0, profit: 0 });

    const [loading, setLoading] = useState(true);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [newExpense, setNewExpense] = useState({ category: '', amount: '', description: '', paymentMethod: 'Card' });

    // New Filter State
    const [filters, setFilters] = useState({ dateRange: 'this_month', category: 'all' });
    const [companyConfig, setCompanyConfig] = useState(null);

    useEffect(() => {
        fetchData();
        fetchConfig();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, allExpenses, allInvoices]);

    const fetchConfig = async () => {
        try {
            const res = await api.get('/company/config');
            setCompanyConfig(res.data.company);
        } catch (e) {
            console.error("Failed to load company config");
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const companyId = localStorage.getItem('companyId');
            const [invoiceRes, expenseRes] = await Promise.all([
                api.get('/invoices', { params: { companyId } }),
                api.get('/expenses', { params: { companyId } })
            ]);

            setAllInvoices(invoiceRes.data);
            setAllExpenses(expenseRes.data);
        } catch (err) {
            console.error("Failed to load finance data", err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        const now = new Date();
        const { dateRange, category } = filters;

        // Helper to check date range
        const isInRange = (dateString) => {
            const d = new Date(dateString);
            if (dateRange === 'this_month') {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            if (dateRange === 'last_month') {
                const lastMonth = new Date();
                lastMonth.setMonth(now.getMonth() - 1);
                return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
            }
            if (dateRange === 'this_quarter') {
                const q = Math.floor((now.getMonth() + 3) / 3);
                const dq = Math.floor((d.getMonth() + 3) / 3);
                return q === dq && d.getFullYear() === now.getFullYear();
            }
            if (dateRange === 'this_year') {
                return d.getFullYear() === now.getFullYear();
            }
            return true; // All
        };

        // Filter Invoices
        const filteredInvoices = allInvoices.filter(inv => isInRange(inv.date || inv.createdAt));

        // Filter Expenses
        let filteredExpenses = allExpenses.filter(exp => isInRange(exp.date));

        if (category !== 'all') {
            filteredExpenses = filteredExpenses.filter(exp => exp.category?.toLowerCase() === category.toLowerCase());
        }

        setExpenses(filteredExpenses);

        // Calculate Stats
        const revenue = filteredInvoices
            .filter(inv => inv.status === 'PAID')
            .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

        const outstanding = filteredInvoices
            .filter(inv => inv.status === 'SENT' || inv.status === 'OVERDUE')
            .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

        const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

        setStats({
            revenue,
            outstanding,
            expenses: totalExpenses,
            profit: revenue - totalExpenses
        });
    };

    const handleCreateExpense = async (e) => {
        e.preventDefault();
        try {
            const companyId = localStorage.getItem('companyId');
            const res = await api.post('/expenses', { ...newExpense, companyId });
            setAllExpenses(prev => [res.data, ...prev]); // Optimistic update
            setShowExpenseModal(false);
            setNewExpense({ category: '', amount: '', description: '', paymentMethod: 'Card' });
        } catch (err) {
            alert('Failed to create expense');
        }
    };

    const handleGenerateReport = () => {
        const element = document.createElement('div');
        element.style.width = '210mm';
        element.style.padding = '15mm';
        element.style.background = 'white';
        element.style.color = '#1e293b';
        element.style.fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";

        const dateStr = new Date().toLocaleDateString();

        // Generate Rows
        const expenseRows = expenses.map(e => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px;">${e.category}</td>
                <td style="padding: 10px;">${new Date(e.date).toLocaleDateString()}</td>
                <td style="padding: 10px;">${e.description || '-'}</td>
                <td style="padding: 10px; text-align: right; color: #ef4444;">-₹${e.amount}</td>
            </tr>
        `).join('');

        element.innerHTML = `
            <div>
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 40px;">
                    ${companyConfig?.logo ? `<img src="${companyConfig.logo}" style="height: 60px; margin-bottom: 10px;" />` : ''}
                    <h1 style="margin: 0; font-size: 24px; color: #0f172a;">${companyConfig?.name || 'Company Name'}</h1>
                    <p style="margin: 5px 0; color: #64748b;">Financial Report</p>
                    <p style="margin: 0; font-size: 14px; color: #94a3b8;">${filters.dateRange.replace('_', ' ').toUpperCase()} • Generated on ${dateStr}</p>
                </div>

                <!-- Summary Cards -->
                <div style="display: flex; gap: 20px; margin-bottom: 40px;">
                    <div style="flex: 1; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Revenue</div>
                        <div style="font-size: 20px; font-weight: bold; color: #16a34a;">+${formatCurrency(stats.revenue)}</div>
                    </div>
                    <div style="flex: 1; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Expenses</div>
                        <div style="font-size: 20px; font-weight: bold; color: #ef4444;">-${formatCurrency(stats.expenses)}</div>
                    </div>
                    <div style="flex: 1; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Net Profit</div>
                        <div style="font-size: 20px; font-weight: bold; color: #2563eb;">${formatCurrency(stats.profit)}</div>
                    </div>
                </div>

                <!-- Expenses Table -->
                <h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">Expense Breakdown</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="background: #f1f5f9; text-align: left;">
                            <th style="padding: 10px;">Category</th>
                            <th style="padding: 10px;">Date</th>
                            <th style="padding: 10px;">Description</th>
                            <th style="padding: 10px; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${expenseRows || '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #94a3b8;">No expenses found for this period.</td></tr>'}
                    </tbody>
                </table>
                
                <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8;">
                    This is a system generated report.
                </div>
            </div>
        `;

        html2pdf().from(element).save(`Finance_Report_${filters.dateRange}.pdf`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    if (loading) return <div className="p-10 text-center">Loading finance data...</div>;

    return (
        <div className="space-y-8">
            {/* HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Financial Overview</h1>
                    <p className="text-sm text-slate-500 mt-1">Track revenue, expenses, and profitability.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleGenerateReport}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
                    >
                        <Download size={18} /> Generate Report
                    </button>
                    <button
                        onClick={() => setShowExpenseModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
                    >
                        <Plus size={18} /> Record Expense
                    </button>
                </div>
            </div>

            {/* FILTERS BAR */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Filter size={16} /> Filters:
                </div>
                <select
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                >
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="this_quarter">This Quarter</option>
                    <option value="this_year">This Year</option>
                    <option value="all">All Time</option>
                </select>
                <select
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                    <option value="all">All Categories</option>
                    <option value="operations">Operations</option>
                    <option value="marketing">Marketing</option>
                    <option value="payroll">Payroll</option>
                    <option value="software">Software</option>
                    <option value="office">Office</option>
                </select>
            </div>

            {/* MAIN STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.revenue)}
                    icon={<TrendingUp size={24} className="text-green-600" />}
                    trend="Based on paid invoices"
                />
                <StatCard
                    title="Total Expenses"
                    value={formatCurrency(stats.expenses)}
                    icon={<Receipt size={24} className="text-red-600" />}
                    trend="Based on recorded expenses"
                />
                <StatCard
                    title="Net Profit"
                    value={formatCurrency(stats.profit)}
                    icon={<DollarSign size={24} className="text-blue-600" />}
                    trend="Revenue - Expenses"
                />
                <StatCard
                    title="Outstanding"
                    value={formatCurrency(stats.outstanding)}
                    icon={<Clock size={24} className="text-amber-600" />}
                    trend="Pending invoices"
                />
            </div>

            {/* EXPENSES SECTION (Expanded) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* REVENUE CHART PLACEHOLDER */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col justify-center items-center text-center">
                    <div className="bg-blue-50 p-4 rounded-full mb-4">
                        <TrendingUp size={32} className="text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Cash Flow Analytics</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-xs">Detailed revenue vs expense charts will appear here based on your data.</p>
                </div>

                {/* RECENT EXPENSES TABLE */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-slate-800">Recent Expenses</h3>
                        <span className="text-xs text-slate-500">
                            {expenses.length} records
                        </span>
                    </div>
                    <div className="flex-grow overflow-y-auto max-h-[400px]">
                        {expenses.length > 0 ? (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {expenses.map((exp) => (
                                        <tr key={exp._id} className="hover:bg-slate-50">
                                            <td className="px-6 py-3 font-medium text-slate-900">{exp.category}</td>
                                            <td className="px-6 py-3 text-slate-500">{formatDate(exp.date)}</td>
                                            <td className="px-6 py-3 text-right font-bold text-red-600">-{formatCurrency(exp.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-10 text-center text-slate-500">No expenses found for this selection.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* EXPENSE MODAL */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">Add Expense</h2>
                        <form onSubmit={handleCreateExpense} className="space-y-4">
                            <input required placeholder="Category (e.g. Rent, Server)" className="w-full border p-2 rounded" value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })} />
                            <input required type="number" placeholder="Amount" className="w-full border p-2 rounded" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} />
                            <input placeholder="Description" className="w-full border p-2 rounded" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} />
                            <select className="w-full border p-2 rounded" value={newExpense.paymentMethod} onChange={e => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}>
                                <option value="Card">Card</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cash">Cash</option>
                            </select>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Add Expense</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const StatCard = ({ title, value, icon, trend }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
        <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-slate-500">{title}</span>
            <div className="bg-slate-50 p-2 rounded-lg">{icon}</div>
        </div>
        <div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-1">{trend}</div>
        </div>
    </div>
);
