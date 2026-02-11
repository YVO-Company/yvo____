import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertTriangle, Search, Filter, X, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';

export default function Inventory() {
    const [searchTerm, setSearchTerm] = useState('');
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        category: '',
        quantityOnHand: 0,
        reorderLevel: 5,
        costPrice: 0,
        sellingPrice: 0,
        description: ''
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const companyId = localStorage.getItem('companyId');
            const response = await api.get('/inventory', { params: { companyId } });
            setInventory(response.data);
        } catch (err) {
            console.error("Failed to fetch inventory", err);
            setError("Failed to load inventory.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setCurrentId(item._id);
            setFormData({
                sku: item.sku,
                name: item.name,
                category: item.category || '',
                quantityOnHand: item.quantityOnHand,
                reorderLevel: item.reorderLevel,
                costPrice: item.costPrice || 0,
                sellingPrice: item.sellingPrice || 0,
                description: item.description || ''
            });
        } else {
            setCurrentId(null);
            setFormData({
                sku: '',
                name: '',
                category: '',
                quantityOnHand: 0,
                reorderLevel: 5,
                costPrice: 0,
                sellingPrice: 0,
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentId(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantityOnHand' || name === 'reorderLevel' || name === 'costPrice' || name === 'sellingPrice'
                ? parseFloat(value) || 0
                : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const companyId = localStorage.getItem('companyId');
            const data = { ...formData, companyId };

            if (currentId) {
                await api.patch(`/inventory/${currentId}`, data);
            } else {
                await api.post('/inventory', data);
            }
            fetchInventory();
            handleCloseModal();
        } catch (err) {
            console.error("Failed to save item", err);
            alert("Failed to save item: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await api.delete(`/inventory/${id}`);
            fetchInventory();
        } catch (err) {
            console.error("Failed to delete item", err);
            alert("Failed to delete item");
        }
    };

    // Helper to determine status based on quantity
    const getStatus = (item) => {
        if (item.quantityOnHand <= 0) return 'Out of Stock';
        if (item.quantityOnHand <= item.reorderLevel) return 'Low Stock';
        return 'In Stock';
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'In Stock': return 'bg-green-100 text-green-800';
            case 'Low Stock': return 'bg-amber-100 text-amber-800';
            case 'Out of Stock': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading && !inventory.length) return <div className="p-10 text-center">Loading inventory...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Track stock levels, manage products, and restock.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
                >
                    <Plus size={18} /> Add Item
                </button>
            </div>

            {/* ALERTS */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="text-amber-600 shrink-0" />
                <div>
                    <h4 className="font-semibold text-amber-800 text-sm">Low Stock Alert</h4>
                    <p className="text-xs text-amber-700 mt-1">
                        {inventory.filter(i => i.quantityOnHand <= i.reorderLevel).length} items are running low on stock.
                    </p>
                </div>
            </div>

            {/* TABLE SECTION */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Package size={20} className="text-slate-400" />
                        <h3 className="text-lg font-semibold text-slate-800">Product List</h3>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-6 py-4 text-left tracking-wider">SKU</th>
                            <th className="px-6 py-4 text-left tracking-wider">Product Name</th>
                            <th className="px-6 py-4 text-left tracking-wider">Category</th>
                            <th className="px-6 py-4 text-left tracking-wider">Stock</th>
                            <th className="px-6 py-4 text-left tracking-wider">Price</th>
                            <th className="px-6 py-4 text-left tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => {
                            const status = getStatus(item);
                            return (
                                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">{item.sku}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.category || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{item.quantityOnHand}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">₹{item.sellingPrice}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>
                                            {status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {inventory.length === 0 && !loading && (
                            <tr>
                                <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                                    No inventory items found. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-semibold text-slate-800">
                                {currentId ? 'Edit Product' : 'Add New Product'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                                    <input
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleChange}
                                        disabled={!!currentId} // Disable SKU edit to prevent issues
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                                        required
                                        placeholder="PROD-001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <input
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        placeholder="Electronics"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                    placeholder="Wireless Headphones"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price (₹)</label>
                                    <input
                                        name="costPrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.costPrice}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (₹)</label>
                                    <input
                                        name="sellingPrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.sellingPrice}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Stock</label>
                                    <input
                                        name="quantityOnHand"
                                        type="number"
                                        min="0"
                                        value={formData.quantityOnHand}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label>
                                    <input
                                        name="reorderLevel"
                                        type="number"
                                        min="0"
                                        value={formData.reorderLevel}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    rows="3"
                                    placeholder="Product details..."
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
                                >
                                    {currentId ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
