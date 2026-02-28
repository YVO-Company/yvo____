import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Save, Download, Trash2, Printer, Search, Lock, Unlock, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import api from '../../services/api';
import InvoiceRenderer from '../../components/invoice-builder/InvoiceRenderer';

export default function InvoiceBuilder({ invoiceId: propId, onClose }) {
    const navigate = useNavigate();
    const { id: paramId } = useParams();
    const { alert, confirm, prompt } = useUI();
    const [searchParams] = useSearchParams();
    const templateIdFromUrl = searchParams.get('templateId');
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
    const [zoom, setZoom] = useState(0.8); // Default zoom level for preview

    const [newAttributeKey, setNewAttributeKey] = useState('');
    const [newAttributeValue, setNewAttributeValue] = useState('');

    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        customerName: '',
        clientAddress: '',
        gstNumber: '',
        date: new Date().toISOString().slice(0, 10),
        dueDate: '',
        items: [],
        status: 'DRAFT',
        taxRate: 10, // Store tax rate in invoice data too if possible, but localized state for now
        customAttributes: []
    });

    useEffect(() => {
        fetchInventory();
        fetchConfig();
        fetchTemplates();
        if (id) fetchInvoice(id);
    }, [id]);

    // Handle templateId from URL to auto-load template
    useEffect(() => {
        if (!id && templateIdFromUrl && templates.length > 0) {
            loadTemplate(templateIdFromUrl);
        }
    }, [templates, templateIdFromUrl, id]);

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
            setZoom(1.0); // Better zoom for view-only mode since sidebar is hidden
            setLoading(false);
        } catch (err) {
            console.error("Failed to load invoice");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!activeLayout && templates.length > 0) {
            if (id && !isEditing) {
                if (invoiceData.layout && invoiceData.layout.length > 0) {
                    setActiveLayout(invoiceData.layout);
                } else if (invoiceData.templateId) {
                    const template = templates.find(t => t._id === invoiceData.templateId);
                    if (template) setActiveLayout(template.layout);
                } else {
                    // Fallback to first template for viewing if nothing else
                    setActiveLayout(templates[0].layout);
                }
            } else if (!id) {
                // For new invoices, use first template as base design
                setActiveLayout(templates[0].layout);
            }
        }
    }, [templates, invoiceData, activeLayout, isEditing, id]);

    useEffect(() => {
        if (isEditing) {
            setZoom(0.8); // Scale down to fit sidebar
        } else if (id) {
            setZoom(1.0); // Scale up to fill centered space
        }
    }, [isEditing, id]);

    const handleUnlockEdit = async () => {
        const inputPass = await prompt(
            "Security Authorization",
            "Enter Invoice Security Password to Edit:",
            "password",
            "Unlock Editor",
            "primary"
        );
        if (!inputPass) return;

        try {
            const companyId = localStorage.getItem('companyId');
            const res = await api.post('/company/verify-password', { password: inputPass, companyId });
            if (res.data.valid) {
                setIsEditing(true);
            } else {
                alert("Security Error", "Incorrect security password provided. Access denied.", "error");
            }
        } catch (err) {
            console.error(err);
            alert("System Error", "Verification service is temporarily unavailable.", "error");
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

        const qty = parseFloat(newItems[index].quantity) || 0;
        const prc = parseFloat(newItems[index].price) || 0;
        newItems[index].total = qty * prc;

        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const removeItem = (index) => {
        const newItems = invoiceData.items.filter((_, i) => i !== index);
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const handlePrint = () => {
        window.print();
    };

    // Determine dynamic columns based on the loaded template layout
    const itemsTableBlock = activeLayout?.find(b => b.type === 'ITEMS_TABLE');
    const tableColumns = itemsTableBlock?.config?.columns || [
        { id: 'col_desc', key: 'description', label: 'Item Description', align: 'left' },
        { id: 'col_qty', key: 'quantity', label: 'Qty', align: 'center' },
        { id: 'col_price', key: 'price', label: 'Price', align: 'right', isCurrency: true },
        { id: 'col_total', key: 'total', label: 'Total', align: 'right', isCurrency: true }
    ];



    const calculateSubtotal = () => invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = calculateSubtotal() * (taxRate / 100);
    const total = calculateSubtotal() + tax;

    // Helper to check if a block type exists in current layout
    const isBlockPresent = (types) => {
        if (!activeLayout) return true; // Show all if no layout loaded yet (classic mode)
        const typeList = Array.isArray(types) ? types : [types];
        return activeLayout.some(block => typeList.includes(block.type));
    };

    const addCustomAttribute = async () => {
        if (!newAttributeKey || !newAttributeValue) return;

        const existingKeys = companyConfig?.invoiceAttributes || [];
        if (!existingKeys.includes(newAttributeKey)) {
            try {
                const companyId = localStorage.getItem('companyId');
                const res = await api.post('/company/invoice-attributes', { companyId, attribute: newAttributeKey });
                setCompanyConfig(prev => ({
                    ...prev,
                    invoiceAttributes: res.data.invoiceAttributes
                }));
            } catch (err) {
                console.error("Failed to save new attribute to company", err);
            }
        }

        setInvoiceData(prev => ({
            ...prev,
            customAttributes: [...(prev.customAttributes || []), { key: newAttributeKey, value: newAttributeValue }]
        }));
        setNewAttributeKey('');
        setNewAttributeValue('');
    };

    const handleSave = async (status = 'DRAFT') => {
        try {
            const companyId = localStorage.getItem('companyId');
            const payload = {
                ...invoiceData,
                items: invoiceData.items.map(i => ({
                    ...i,
                    quantity: parseFloat(i.quantity) || 0,
                    price: parseFloat(i.price) || 0,
                    total: parseFloat(i.total) || 0
                })),
                companyId,
                status,
                grandTotal: total,
                taxRate: parseFloat(taxRate) || 0,
                layout: activeLayout || [],
                templateId: templates.find(t => JSON.stringify(t.layout) === JSON.stringify(activeLayout))?._id || invoiceData.templateId
            };

            if (id) {
                await api.patch(`/invoices/${id}`, payload); // Update using PATCH
            } else {
                await api.post('/invoices', payload); // Create new
            }

            await alert("Invoice Created", `Invoice ${status === 'DRAFT' ? 'saved' : 'created'} successfully!`, "success");
            if (onClose) {
                onClose(); // Close drawer if applicable
                window.location.reload(); // Refresh to show updates (simple fix)
            } else {
                navigate('/dashboard/finance');
            }
        } catch (err) {
            console.error(err);
            alert("Save Failed", (err.response?.data?.message || err.message), "error");
        }
    };

    const handleSaveAsTemplate = async () => {
        if (!templateName) {
            alert("Template Error", "Please enter a valid name for this template.", "error");
            return;
        }
        try {
            const companyId = localStorage.getItem('companyId');
            const payload = {
                companyId,
                name: templateName,
                type: 'COMPANY',
                items: invoiceData.items.map(i => ({ ...i })), // Preserving all custom column values
                taxRate,
                layout: activeLayout // Saving the custom design
            };
            await api.post('/invoice-templates', payload);
            alert("Template Saved", "This invoice structure has been saved to your company templates.", "success");
            setShowTemplateModal(false);
            setTemplateName('');
            fetchTemplates();
        } catch (err) {
            console.error(err);
            alert("Template Save Failed", (err.response?.data?.message || err.message), "error");
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



    return (
        <div className="flex flex-col lg:flex-row w-full h-[calc(90vh-70px)] overflow-hidden bg-slate-50 relative rounded-b-2xl">
            {/* EDITOR SIDEBAR (Hidden in View Mode or when printing) */}
            {(isEditing || !id) && (
                <div className="w-full lg:w-1/3 bg-white border border-slate-200 rounded-xl p-6 overflow-y-auto print:hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Invoice Settings</h2>
                        {isEditing && (
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

                        {isBlockPresent(['CUSTOMER_DETAILS', 'BILL_TO_BLOCK', 'BILL_TO_LABEL']) && (
                            <>
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
                            </>
                        )}

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

                        {isBlockPresent('CUSTOM_ATTRIBUTES') && (
                            <div className="mt-6 border-t border-slate-200 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-slate-800">Custom Attributes</h3>
                                </div>
                                <div className="space-y-3 mb-4">
                                    {invoiceData.customAttributes?.map((attr, index) => (
                                        <div key={index} className="flex gap-2 items-center bg-slate-50 p-2 rounded">
                                            <div className="flex-1 text-sm font-semibold text-slate-700">{attr.key}</div>
                                            <div className="flex-1 text-sm text-slate-600">{attr.value}</div>
                                            <button onClick={() => {
                                                const newAttrs = [...(invoiceData.customAttributes || [])];
                                                newAttrs.splice(index, 1);
                                                setInvoiceData({ ...invoiceData, customAttributes: newAttrs });
                                            }} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {isEditing && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            list="company-attributes"
                                            className="flex-1 p-2 border rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                            placeholder="Name (e.g. E-way Bill)"
                                            value={newAttributeKey}
                                            onChange={(e) => setNewAttributeKey(e.target.value)}
                                        />
                                        <datalist id="company-attributes">
                                            {companyConfig?.invoiceAttributes?.map((attr, i) => (
                                                <option key={i} value={attr} />
                                            ))}
                                        </datalist>
                                        <input
                                            type="text"
                                            className="flex-1 p-2 border rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                            placeholder="Value"
                                            value={newAttributeValue}
                                            onChange={(e) => setNewAttributeValue(e.target.value)}
                                        />
                                        <button
                                            onClick={addCustomAttribute}
                                            className="p-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}


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
                                        <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Select Product Base</label>
                                        <select
                                            className="w-full p-2 border border-slate-200 rounded text-sm bg-white"
                                            value={item.inventoryId}
                                            onChange={e => updateItem(index, 'inventoryId', e.target.value)}
                                        >
                                            <option value="">Select from Inventory...</option>
                                            {inventory.map(inv => (
                                                <option key={inv._id} value={inv._id}>{inv.name} (₹{inv.sellingPrice})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mt-3 bg-white border border-slate-100 p-2 rounded flex flex-wrap gap-3">
                                        {tableColumns.map(col => {
                                            if (col.key === 'total') {
                                                return (
                                                    <div key={col.id} className="flex-1 min-w-[80px]">
                                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">{col.label}</label>
                                                        <div className="text-sm font-bold pt-1 text-indigo-700 bg-indigo-50 px-2 py-1 rounded inline-block">
                                                            {col.isCurrency ? '₹' : ''}{(item.total || 0).toFixed(2)}
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={col.id} className={`flex-1 min-w-[${col.key === 'description' ? '120px' : '80px'}]`}>
                                                    <label className="text-[10px] text-slate-700 font-bold uppercase tracking-wider block mb-0.5">{col.label}</label>
                                                    <input
                                                        type={col.key === 'quantity' || col.key === 'price' || col.isCurrency ? 'number' : 'text'}
                                                        className="w-full p-1.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                                        value={item[col.key] !== undefined ? item[col.key] : ''}
                                                        placeholder={col.label}
                                                        onChange={e => {
                                                            const val = (col.key === 'quantity' || col.key === 'price' || col.isCurrency)
                                                                ? (parseFloat(e.target.value) || 0)
                                                                : e.target.value;
                                                            updateItem(index, col.key, val);
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
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
            )}

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
            <div className="flex-1 flex flex-col items-center justify-start bg-slate-100 p-8 overflow-y-auto print:bg-white print:p-0 relative">

                {/* Header Action Portal (Moves Edit button to Modal Header) */}
                {document.getElementById('modal-header-actions') && !isEditing && id && !loading && createPortal(
                    <button
                        onClick={handleUnlockEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Unlock size={16} /> <span className="text-xs font-black uppercase tracking-widest text-nowrap">Edit Invoice</span>
                    </button>,
                    document.getElementById('modal-header-actions')
                )}

                <div
                    className="origin-top transition-transform duration-300 shadow-2xl"
                    style={{ transform: `scale(${zoom})` }}
                >
                    <InvoiceRenderer
                        layout={activeLayout}
                        invoiceData={invoiceData}
                        companyConfig={companyConfig}
                        taxRate={taxRate}
                        calculateSubtotal={calculateSubtotal}
                        tax={tax}
                        total={total}
                    />
                </div>

                {/* FOOTER CONTROLS (Only in Edit Mode) */}
                {isEditing && (
                    <div className="mt-6 flex flex-wrap justify-center gap-4 print:hidden">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm mr-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preview Zoom</label>
                            <input
                                type="range"
                                min="0.3"
                                max="1.5"
                                step="0.05"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-32 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <span className="text-xs font-bold text-slate-600 w-10">{Math.round(zoom * 100)}%</span>
                        </div>
                        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 shadow-xl shadow-slate-200 hover:shadow-2xl transition-all transform hover:-translate-y-0.5">
                            <Printer size={18} /> Print Invoice
                        </button>
                        <button onClick={() => handleSave(invoiceData.status)} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-full font-bold hover:bg-slate-50 shadow-sm transition-all">
                            <Save size={18} /> Quick Save
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
