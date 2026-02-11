import React, { useState, useEffect } from 'react';
import { Plus, Download, Filter, Calendar as CalIcon, TrendingUp, DollarSign, Receipt, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';

export default function Finance() {
    const [expenses, setExpenses] = useState([]);
    const [stats, setStats] = useState({ revenue: 0, outstanding: 0, expenses: 0, profit: 0 });
    const [loading, setLoading] = useState(true);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [newExpense, setNewExpense] = useState({ category: '', amount: '', description: '', paymentMethod: 'Card' });

    // New Filter State
    const [filters, setFilters] = useState({ dateRange: 'this_month', category: 'all' });

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            const companyId = localStorage.getItem('companyId');
            // Fetch invoices just for stats calculation
            const [invoiceRes, expenseRes] = await Promise.all([
                api.get('/invoices', { params: { companyId } }),
                api.get('/expenses', { params: { companyId } })
            ]);

            const invoiceData = invoiceRes.data;
            const expenseData = expenseRes.data;
            setExpenses(expenseData);

            // Calculate Stats (Mocking filtered data logic here)
            const revenue = invoiceData
                .filter(inv => inv.status === 'PAID')
                .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

            const outstanding = invoiceData
                .filter(inv => inv.status === 'SENT' || inv.status === 'OVERDUE')
                .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

            const totalExpenses = expenseData.reduce((sum, exp) => sum + (exp.amount || 0), 0);

            setStats({
                revenue,
                outstanding,
                expenses: totalExpenses,
                profit: revenue - totalExpenses
            });

        } catch (err) {
            console.error("Failed to load finance data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExpense = async (e) => {
        e.preventDefault();
        try {
            const companyId = localStorage.getItem('companyId');
            await api.post('/expenses', { ...newExpense, companyId });
            setShowExpenseModal(false);
            setNewExpense({ category: '', amount: '', description: '', paymentMethod: 'Card' });
            fetchData();
        } catch (err) {
            alert('Failed to create expense');
        }
    };

    const handleGenerateReport = () => {
        alert(`Generating ${filters.dateRange} report... (Feature coming soon)`);
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
                </select>
            </div>

            {/* MAIN STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.revenue)}
                    icon={<TrendingUp size={24} className="text-green-600" />}
                    trend="+12% vs last month"
                />
                <StatCard
                    title="Total Expenses"
                    value={formatCurrency(stats.expenses)}
                    icon={<Receipt size={24} className="text-red-600" />}
                    trend="+5% vs last month"
                />
                <StatCard
                    title="Net Profit"
                    value={formatCurrency(stats.profit)}
                    icon={<DollarSign size={24} className="text-blue-600" />}
                    trend="+8% vs last month"
                />
                <StatCard
                    title="Outstanding"
                    value={formatCurrency(stats.outstanding)}
                    icon={<Clock size={24} className="text-amber-600" />}
                    trend="3 invoices pending"
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
                        <button className="text-sm text-indigo-600 hover:underline">View All</button>
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
                            <div className="p-10 text-center text-slate-500">No expenses recorded yet.</div>
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
