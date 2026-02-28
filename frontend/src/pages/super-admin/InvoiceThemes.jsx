import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, FileText, Check, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import TemplateDesigner from '../../components/invoice-builder/TemplateDesigner';

export default function InvoiceThemes() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'GLOBAL',
        themeIdentifier: 'classic',
        taxRate: 10,
        notes: '',
        layout: []
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const res = await api.get('/invoice-templates');
            setTemplates(res.data.filter(t => t.type === 'GLOBAL'));
        } catch (error) {
            console.error(error);
            toast.error("Failed to load global templates");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (template = null) => {
        if (template) {
            setCurrentTemplate(template);
            setFormData({
                name: template.name,
                type: 'GLOBAL',
                themeIdentifier: template.themeIdentifier || 'classic',
                taxRate: template.taxRate !== undefined ? template.taxRate : 10,
                notes: template.notes || '',
                layout: template.layout || []
            });
        } else {
            setCurrentTemplate(null);
            setFormData({
                name: '',
                type: 'GLOBAL',
                themeIdentifier: 'classic',
                taxRate: 10,
                notes: '',
                layout: [
                    { id: 'default_header', type: 'HEADER_BLOCK', config: {} },
                    { id: 'default_title', type: 'INVOICE_TITLE', config: {} },
                    { id: 'default_billto', type: 'BILL_TO_BLOCK', config: {} },
                    { id: 'default_items', type: 'ITEMS_TABLE', config: {} },
                    { id: 'default_totals', type: 'TOTALS_BLOCK', config: {} },
                    { id: 'default_notes', type: 'NOTES_BLOCK', config: {} }
                ]
            });
        }
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (currentTemplate) {
                await api.patch(`/invoice-templates/${currentTemplate._id}`, formData);
                toast.success("Global template updated");
            } else {
                await api.post('/invoice-templates', formData);
                toast.success("Global template created");
            }
            setShowModal(false);
            fetchTemplates();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save global template");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this global template? It will be removed for all companies.")) return;
        try {
            await api.delete(`/invoice-templates/${id}`);
            toast.success("Global template deleted");
            fetchTemplates();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete global template");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Global Invoice Templates</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage standard layouts available to all companies.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                    <Plus size={18} /> New Global Template
                </button>
            </div>

            {loading ? (
                <div className="p-10 text-center text-slate-500 animate-pulse">Loading templates...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4 text-left">Template Name</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {templates.map(template => (
                                <tr key={template._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} className="text-indigo-500" />
                                            {template.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(template)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded bg-white border border-slate-200"
                                                title="Edit Template"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(template._id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded bg-white border border-slate-200"
                                                title="Delete Template"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {templates.length === 0 && (
                                <tr>
                                    <td colSpan="2" className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                                        No global templates found. Create one to provide defaults to companies.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileText size={20} className="text-indigo-600" />
                                {currentTemplate ? 'Edit Global Template' : 'New Global Template'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4 flex flex-col min-h-0 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    placeholder="e.g., Standard Service Invoice"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="mt-8 border-t border-slate-200 pt-6 flex-1 min-h-[500px]">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <FileText size={20} className="text-indigo-600" />
                                    Invoice Layout Builder
                                </h3>
                                <p className="text-sm text-slate-500 mb-6">Drag and drop blocks to design the structure of this invoice template. Companies will only see the blocks you include.</p>

                                <TemplateDesigner
                                    value={formData.layout}
                                    onChange={(newLayout) => setFormData({ ...formData, layout: newLayout })}
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                                >
                                    <Check size={16} /> Save Template
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
