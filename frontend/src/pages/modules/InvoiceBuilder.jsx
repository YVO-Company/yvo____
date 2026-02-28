import React, { useState, useEffect } from 'react';
import { Plus, Save, Download, Trash2, Printer, Search, Lock, Unlock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import InvoiceRenderer from '../../components/invoice-builder/InvoiceRenderer';

export default function InvoiceBuilder({ invoiceId: propId, onClose }) {
    const navigate = useNavigate();
    const { id: paramId } = useParams();
    const id = propId || paramId; // Use prop if available (Drawer), else param

    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(!id);
    const [securityPassword, setSecurityPassword] = useState('');
    const [companyConfig, setCompanyConfig] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateName, setTemplateName] = useState('');

    // Tax Rate State (Default 10%)
    const [taxRate, setTaxRate] = useState(10);
    const [activeLayout, setActiveLayout] = useState(null); // The loaded template's layout array

    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        customerName: '',
        clientAddress: '',
        gstNumber: '',
        date: new Date().toISOString().slice(0, 10),
        dueDate: '',
        items: [],
        status: 'DRAFT',
        taxRate: 10 // Store tax rate in invoice data too if possible, but localized state for now
    });

    useEffect(() => {
        fetchInventory();
        fetchConfig();
        fetchTemplates();
        if (id) fetchInvoice(id);
    }, [id]);

    const fetchTemplates = async () => {
        try {
            const companyId = localStorage.getItem('companyId');
            const res = await api.get('/invoice-templates', { params: { companyId } });
            setTemplates(res.data);
        } catch (e) {
            console.error("Failed to fetch templates");
        }
    };

    const fetchConfig = async () => {
        try {
            const companyId = localStorage.getItem('companyId');
            const res = await api.get(`/company/config`);
            setCompanyConfig(res.data.company);
        } catch (e) { }
    };

    const fetchInvoice = async (invoiceId) => {
        try {
            const res = await api.get(`/invoices/${invoiceId}`);
            setInvoiceData(res.data);
            if (res.data.taxRate !== undefined) {
                setTaxRate(res.data.taxRate);
            }
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to load invoice");
        }
    };

    const handleUnlockEdit = async () => {
        const inputPass = prompt("Enter Invoice Security Password to Edit:");
        if (!inputPass) return;

        try {
            const companyId = localStorage.getItem('companyId');
            const res = await api.post('/company/verify-password', { password: inputPass, companyId });
            if (res.data.valid) {
                setIsEditing(true);
            } else {
                alert("Incorrect Password!");
            }
        } catch (err) {
            console.error(err);
            alert("Verification failed");
        }
    };

    const fetchInventory = async () => {
        try {
            const companyId = localStorage.getItem('companyId');
            const res = await api.get('/inventory', { params: { companyId } });
            setInventory(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const addItem = () => {
        setInvoiceData(prev => ({
            ...prev,
            items: [...prev.items, { inventoryId: '', description: '', quantity: 1, price: 0, total: 0 }]
        }));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...invoiceData.items];
        newItems[index][field] = value;

        if (field === 'inventoryId') {
            const product = inventory.find(i => i._id === value);
            if (product) {
                newItems[index].description = product.name;
                newItems[index].price = product.sellingPrice;
                newItems[index].inventoryId = product._id;
            }
        }

        newItems[index].total = newItems[index].quantity * newItems[index].price;
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const removeItem = (index) => {
        const newItems = invoiceData.items.filter((_, i) => i !== index);
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const calculateSubtotal = () => invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = calculateSubtotal() * (taxRate / 100);
    const total = calculateSubtotal() + tax;

    const handleSave = async (status = 'DRAFT') => {
        try {
            const companyId = localStorage.getItem('companyId');
            const payload = { ...invoiceData, companyId, status, grandTotal: total, taxRate };

            if (id) {
                await api.patch(`/invoices/${id}`, payload); // Update using PATCH
            } else {
                await api.post('/invoices', payload); // Create new
            }

            alert(`Invoice ${status === 'DRAFT' ? 'saved' : 'created'} successfully!`);
            if (onClose) {
                onClose(); // Close drawer if applicable
                window.location.reload(); // Refresh to show updates (simple fix)
            } else {
                navigate('/dashboard/finance');
            }
        } catch (err) {
            console.error(err);
            alert("Failed to save invoice: " + (err.response?.data?.message || err.message));
        }
    };

    const handleSaveAsTemplate = async () => {
        if (!templateName) return alert("Please enter a template name");
        try {
            const companyId = localStorage.getItem('companyId');
            const payload = {
                companyId,
                name: templateName,
                type: 'COMPANY',
                items: invoiceData.items.map(i => ({ description: i.description, quantity: i.quantity, price: i.price, total: i.total })),
                taxRate
            };
            await api.post('/invoice-templates', payload);
            alert("Template saved successfully!");
            setShowTemplateModal(false);
            setTemplateName('');
            fetchTemplates();
        } catch (err) {
            console.error(err);
            alert("Failed to save template");
        }
    };

    const loadTemplate = (templateId) => {
        if (!templateId) return;
        const template = templates.find(t => t._id === templateId);
        if (template) {
            setInvoiceData(prev => ({
                ...prev,
                items: template.items && template.items.length > 0 ? template.items.map(i => ({ ...i, inventoryId: '' })) : prev.items
            }));
            setTaxRate(template.taxRate !== undefined ? template.taxRate : 10);
            setActiveLayout(template.layout && template.layout.length > 0 ? template.layout : null);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
            {/* EDITOR SIDEBAR (Hidden when printing) */}
            <div className="w-full lg:w-1/3 bg-white border border-slate-200 rounded-xl p-6 overflow-y-auto print:hidden">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Invoice Settings</h2>
                    {!isEditing ? (
                        <button onClick={handleUnlockEdit} className="text-indigo-600 flex items-center gap-1 text-sm font-medium hover:underline">
                            <Lock size={14} /> Unlock to Edit
                        </button>
                    ) : (
                        <span className="text-green-600 flex items-center gap-1 text-xs font-medium bg-green-50 px-2 py-1 rounded">
                            <Unlock size={14} /> Editing Mode
                        </span>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Load from Template</label>
                    <select
                        className="w-full p-2 border rounded"
                        onChange={(e) => loadTemplate(e.target.value)}
                        disabled={!isEditing}
                    >
                        <option value="">-- Select a Template --</option>
                        {templates.map(t => (
                            <option key={t._id} value={t._id}>{t.name} {t.type === 'GLOBAL' ? '(Global)' : ''}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Number</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={invoiceData.invoiceNumber}
                            onChange={e => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={invoiceData.customerName}
                            onChange={e => setInvoiceData({ ...invoiceData, customerName: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Client Address</label>
                        <textarea
                            className="w-full p-2 border rounded"
                            value={invoiceData.clientAddress}
                            onChange={e => setInvoiceData({ ...invoiceData, clientAddress: e.target.value })}
                            disabled={!isEditing}
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">GST / Tax ID</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={invoiceData.gstNumber}
                            onChange={e => setInvoiceData({ ...invoiceData, gstNumber: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>

                    {/* GST RATIO CONFIG */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={taxRate}
                                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                                disabled={!isEditing}
                            />
                            {isEditing && (
                                <button
                                    onClick={() => setTaxRate(0)}
                                    className="px-3 py-2 text-xs bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100 whitespace-nowrap"
                                >
                                    Remove Tax
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded"
                                value={invoiceData.date}
                                onChange={e => setInvoiceData({ ...invoiceData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded"
                                value={invoiceData.dueDate}
                                onChange={e => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-800">Items</h3>
                        <button onClick={addItem} className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:underline">
                            <Plus size={16} /> Add Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {invoiceData.items.map((item, index) => (
                            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative group">
                                <button
                                    onClick={() => removeItem(index)}
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="mb-2">
                                    <label className="text-xs text-slate-500">Product</label>
                                    <select
                                        className="w-full p-1.5 border rounded text-sm bg-white"
                                        value={item.inventoryId}
                                        onChange={e => updateItem(index, 'inventoryId', e.target.value)}
                                    >
                                        <option value="">Select from Inventory...</option>
                                        {inventory.map(inv => (
                                            <option key={inv._id} value={inv._id}>{inv.name} (₹{inv.sellingPrice})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-xs text-slate-500">Qty</label>
                                        <input
                                            type="number"
                                            className="w-full p-1 border rounded text-sm"
                                            value={item.quantity}
                                            onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Price</label>
                                        <input
                                            type="number"
                                            className="w-full p-1 border rounded text-sm"
                                            value={item.price}
                                            onChange={e => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Total</label>
                                        <div className="text-sm font-medium pt-1.5 text-right">₹{item.total.toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 space-y-3 pt-6 border-t border-slate-200">
                    {isEditing && (
                        <button onClick={() => setShowTemplateModal(true)} className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50">
                            <Save size={18} /> Save as Template
                        </button>
                    )}
                    <button onClick={() => handleSave('DRAFT')} className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50">
                        <Save size={18} /> Save as Draft
                    </button>
                    <button onClick={() => handleSave('PAID')} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm">
                        <Save size={18} /> Save & Record Sale
                    </button>
                </div>
            </div>

            {/* Template Name Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <h2 className="text-lg font-bold mb-4">Save as Template</h2>
                        <input
                            type="text"
                            className="w-full p-2 border rounded mb-4"
                            placeholder="Template Name (e.g., Monthly Services)"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowTemplateModal(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                            <button onClick={handleSaveAsTemplate} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* PREVIEW AREA (The Paper Invoice) */}
            <div className="flex-1 bg-slate-100 rounded-xl p-8 overflow-y-auto flex flex-col items-center print:bg-white print:p-0 print:block">

                <InvoiceRenderer
                    layout={activeLayout}
                    invoiceData={invoiceData}
                    companyConfig={companyConfig}
                    taxRate={taxRate}
                    calculateSubtotal={calculateSubtotal}
                    tax={tax}
                    total={total}
                />

                <div className="mt-6 flex gap-4 print:hidden">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 shadow-xl shadow-slate-200 hover:shadow-2xl transition-all transform hover:-translate-y-0.5">
                        <Printer size={18} /> Print Invoice
                    </button>
                    <button onClick={() => handleSave(invoiceData.status)} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-full font-bold hover:bg-slate-50 shadow-sm transition-all">
                        <Save size={18} /> Quick Save
                    </button>
                </div>
            </div>
        </div>
    );
}
