import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Phone, MapPin, Mail, FileText, IndianRupee, History, Activity } from 'lucide-react';
import GlobalModal from '../layout/GlobalModal';

export default function CustomerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { config } = useOutletContext();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, invoices, payments, ledger
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        method: 'CASH'
    });

    const handleReceivePayment = async (e) => {
        e.preventDefault();
        try {
            const companyId = localStorage.getItem('companyId');
            if (!companyId) throw new Error('Company ID not found');
            await api.post('/client-payments', {
                companyId: companyId,
                customerId: customer._id,
                amount: parseFloat(paymentData.amount),
                date: paymentData.date,
                method: paymentData.method
            });
            toast.success('Payment recorded successfully');
            setIsPaymentModalOpen(false);
            setPaymentData({ amount: '', date: new Date().toISOString().slice(0, 10), method: 'CASH' });
            fetchCustomerLedger();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record payment');
        }
    };

    const fetchCustomerLedger = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/customers/${id}/ledger`);
            setCustomer(res.data);
        } catch (error) {
            toast.error('Failed to load customer profile');
            navigate('/dashboard/customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCustomerLedger();
        }
    }, [id]);

    if (loading) return <div className="p-8"><div className="animate-pulse">Loading profile...</div></div>;
    if (!customer) return <div className="p-8">Customer not found.</div>;

    // Build ledger by combining invoices and payments
    const ledger = [];
    (customer.invoices || []).forEach(inv => {
        if (inv.status !== 'DRAFT' && inv.status !== 'CANCELLED') {
            ledger.push({
                type: 'INVOICE',
                date: new Date(inv.date),
                ref: inv.invoiceNumber,
                amount: inv.grandTotal,
                balanceImpact: inv.grandTotal
            });
        }
    });
    (customer.payments || []).forEach(pay => {
        ledger.push({
            type: 'PAYMENT',
            date: new Date(pay.date),
            ref: pay.method || 'CASH',
            amount: pay.amount,
            balanceImpact: -pay.amount
        });
    });

    // Sort by date ascending to calculate running balance
    ledger.sort((a, b) => a.date - b.date);
    let runningBalance = 0;
    const statement = ledger.map(entry => {
        runningBalance += entry.balanceImpact;
        return { ...entry, runningBalance };
    });
    // Reverse for displaying newest first
    statement.reverse();

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/customers')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-800">{customer.name}</h1>
                    <p className="text-sm text-slate-500 mt-1">Customer Profile & Financial Ledger</p>
                </div>
                <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-green-700 transition"
                >
                    <IndianRupee size={16} />
                    <span className="hidden sm:inline">Receive Payment</span>
                </button>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Invoiced</p>
                        <p className="text-2xl font-bold text-slate-800">₹{(customer.totalInvoiced || 0).toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <IndianRupee size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Received</p>
                        <p className="text-2xl font-bold text-slate-800">₹{(customer.totalReceived || 0).toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Due</p>
                        <p className={`text-2xl font-bold ${(customer.totalDue || 0) > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                            ₹{(customer.totalDue || 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200 bg-slate-50 px-2 pt-2 gap-2 overflow-x-auto">
                    {[
                        { id: 'overview', icon: <User size={16} />, label: 'Overview' },
                        { id: 'invoices', icon: <FileText size={16} />, label: 'Invoices' },
                        { id: 'payments', icon: <IndianRupee size={16} />, label: 'Payments' },
                        { id: 'ledger', icon: <History size={16} />, label: 'Statement (Ledger)' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors \${activeTab === tab.id ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-t-lg'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-800">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-500 flex items-center gap-2"><Phone size={14} /> Phone</span>
                                    <span className="font-medium text-slate-800">{customer.phone || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-500 flex items-center gap-2"><Mail size={14} /> Email</span>
                                    <span className="font-medium text-slate-800">{customer.email || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-500 flex items-center gap-2"><MapPin size={14} /> Address</span>
                                    <span className="font-medium text-slate-800">{customer.address || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-500">Tax ID / GST</span>
                                    <span className="font-medium text-slate-800">{customer.taxId || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'invoices' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Invoice #</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(customer.invoices || []).length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-4 text-slate-500">No invoices found.</td></tr>
                                    ) : (
                                        (customer.invoices || []).map(inv => (
                                            <tr key={inv._id} className="hover:bg-slate-50 transition">
                                                <td className="px-4 py-3">{new Date(inv.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-medium text-indigo-600 cursor-pointer" onClick={() => navigate(`/dashboard/invoices/new?id=${inv._id}`)}>{inv.invoiceNumber}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold \${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : inv.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">₹{inv.grandTotal.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Method</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(customer.payments || []).length === 0 ? (
                                        <tr><td colSpan="3" className="text-center py-4 text-slate-500">No payments found.</td></tr>
                                    ) : (
                                        (customer.payments || []).map(pay => (
                                            <tr key={pay._id} className="hover:bg-slate-50 transition">
                                                <td className="px-4 py-3">{new Date(pay.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-slate-700 font-medium">{pay.method || 'CASH'}</td>
                                                <td className="px-4 py-3 text-right font-medium text-green-600">₹{pay.amount.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'ledger' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Details</th>
                                        <th className="px-4 py-3 text-right">Debit (Invoiced)</th>
                                        <th className="px-4 py-3 text-right">Credit (Received)</th>
                                        <th className="px-4 py-3 text-right font-bold text-slate-800">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {statement.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-4 text-slate-500">No transactions recorded.</td></tr>
                                    ) : (
                                        statement.map((entry, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition">
                                                <td className="px-4 py-3">{entry.date.toLocaleDateString()}</td>
                                                <td className="px-4 py-3">
                                                    {entry.type === 'INVOICE'
                                                        ? <span className="text-indigo-600 font-medium">Invoice #{entry.ref}</span>
                                                        : <span className="text-slate-700 font-medium">Payment via {entry.ref}</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {entry.type === 'INVOICE' ? `₹${entry.amount.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-green-600">
                                                    {entry.type === 'PAYMENT' ? `₹${entry.amount.toLocaleString()}` : '-'}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-bold \${entry.runningBalance > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                                    ₹{entry.runningBalance.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Receive Payment Modal */}
            <GlobalModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title={`Receive Payment: \${customer.name}`}
                maxWidth="sm"
            >
                <form onSubmit={handleReceivePayment} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label>
                        <input
                            type="number"
                            required
                            min="1"
                            step="0.01"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={paymentData.amount}
                            onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                        <input
                            type="date"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={paymentData.date}
                            onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                            value={paymentData.method}
                            onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                        >
                            <option value="CASH">Cash</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="UPI">UPI / Online</option>
                            <option value="CHEQUE">Cheque</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t">
                        <button
                            type="button"
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg"
                        >
                            Save Payment
                        </button>
                    </div>
                </form>
            </GlobalModal>
        </div>
    );
}
