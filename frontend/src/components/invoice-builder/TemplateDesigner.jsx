import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { X, Type, Image, Hash, DollarSign, FileText, Settings, AlignLeft, Grid } from 'lucide-react';
import { renderBlock } from './InvoiceRenderer';

const mmToPx = 3.7795275591; // 1mm = ~3.78px for screen resolution matching A4
const A4_WIDTH_PX = 210 * mmToPx;
const A4_HEIGHT_PX = 297 * mmToPx;

// Break down blocks into granular widgets
const AVAILABLE_WIDGETS = [
    { type: 'LOGO', label: 'Company Logo', defaultW: 150, defaultH: 80, icon: <Image size={16} /> },
    { type: 'COMPANY_NAME', label: 'Company Name', defaultW: 200, defaultH: 40, icon: <Type size={16} /> },
    { type: 'COMPANY_DETAILS', label: 'Company Details', defaultW: 200, defaultH: 60, icon: <Type size={16} /> },

    { type: 'INVOICE_TITLE_LABEL', label: '"INVOICE" Title', defaultW: 200, defaultH: 60, icon: <Type size={16} /> },
    { type: 'INVOICE_DETAILS', label: 'Invoice # / Date block', defaultW: 250, defaultH: 80, icon: <Hash size={16} /> },

    { type: 'BILL_TO_LABEL', label: '"Bill To" Label', defaultW: 200, defaultH: 30, icon: <Type size={16} /> },
    { type: 'CUSTOMER_DETAILS', label: 'Customer Details', defaultW: 250, defaultH: 80, icon: <AlignLeft size={16} /> },

    { type: 'ITEMS_TABLE', label: 'Items Table', defaultW: 700, defaultH: 150, icon: <FileText size={16} /> },
    { type: 'TOTALS', label: 'Totals Block', defaultW: 300, defaultH: 120, icon: <DollarSign size={16} /> },

    { type: 'NOTES_LABEL', label: '"Terms & Notes" Label', defaultW: 200, defaultH: 30, icon: <Type size={16} /> },
    { type: 'NOTES_CONTENT', label: 'Notes Content', defaultW: 400, defaultH: 80, icon: <AlignLeft size={16} /> },

    { type: 'STATIC_TEXT', label: 'Custom Static Text', defaultW: 200, defaultH: 40, icon: <Type size={16} /> },
    { type: 'CUSTOM_ATTRIBUTES', label: 'Custom Attributes Grid', defaultW: 400, defaultH: 80, icon: <Grid size={16} /> },
];

const dummyData = {
    invoiceData: {
        invoiceNumber: 'INV-2024-001',
        date: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'PENDING',
        customerName: 'Acme Corp',
        clientAddress: '123 Business Rd\nTech City',
        gstNumber: '22AAAAA0000A1Z5',
        notes: 'Thank you for your business.',
        items: [
            { description: 'Web Dev', quantity: 1, price: 1500, total: 1500 },
        ],
        customAttributes: [
            { key: 'PO Number', value: 'PO-998877' }
        ]
    },
    companyConfig: {
        name: 'Your Company Name',
        address: '456 Startup Blvd',
        email: 'hello@yourcompany.com',
        phone: '+1 (555) 123-4567',
        website: 'www.yourcompany.com'
    },
    taxRate: 10,
    calculateSubtotal: () => 1500,
    tax: 150,
    total: 1650
};

export default function TemplateDesigner({ value, onChange }) {
    const [layout, setLayout] = useState(value || []);
    const [selectedBlockId, setSelectedBlockId] = useState(null);

    // Sync upward
    useEffect(() => {
        onChange(layout);
    }, [layout, onChange]);

    // Deselect when clicking outside A4
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.canvas-block') && !e.target.closest('.sidebar-controls')) {
                setSelectedBlockId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addWidget = (widgetInfo) => {
        // Place new blocks somewhere near the top middle
        const newBlock = {
            id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: widgetInfo.type,
            config: {
                x: 50,
                y: 50 + (layout.length * 20),
                width: widgetInfo.defaultW,
                height: widgetInfo.defaultH,
                text: widgetInfo.label, // default for static text
                fontSize: 14,
                fontWeight: 'normal',
                textAlign: 'left',
                color: '#1e293b', // slate-800
                backgroundColor: 'transparent',
                ...(widgetInfo.type === 'ITEMS_TABLE' ? {
                    columns: [
                        { id: 'col_desc', key: 'description', label: 'Item Description', align: 'left', width: 'auto' },
                        { id: 'col_qty', key: 'quantity', label: 'Qty', align: 'center', width: '80px' },
                        { id: 'col_price', key: 'price', label: 'Price', align: 'right', isCurrency: true, width: '120px' },
                        { id: 'col_total', key: 'total', label: 'Total', align: 'right', isCurrency: true, width: '120px' }
                    ]
                } : {})
            }
        };
        setLayout([...layout, newBlock]);
        setSelectedBlockId(newBlock.id);
    };

    const removeBlock = (id) => {
        setLayout(layout.filter(b => b.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const updateBlockPositionAndSize = (id, newX, newY, newWidth, newHeight) => {
        setLayout(prev => prev.map(b => {
            if (b.id === id) {
                return {
                    ...b,
                    config: {
                        ...b.config,
                        x: newX !== undefined ? newX : b.config.x,
                        y: newY !== undefined ? newY : b.config.y,
                        width: newWidth !== undefined ? newWidth : b.config.width,
                        height: newHeight !== undefined ? newHeight : b.config.height,
                    }
                };
            }
            return b;
        }));
    };

    const updateBlockConfig = (id, key, val) => {
        setLayout(layout.map(b => b.id === id ? { ...b, config: { ...b.config, [key]: val } } : b));
    };

    const selectedBlock = layout.find(b => b.id === selectedBlockId);

    return (
        <div className="flex w-full h-full overflow-hidden bg-slate-50 relative">

            {/* LEFT SIDEBAR: Add Elements */}
            <div className="sidebar-controls w-64 bg-white border-r border-slate-200 p-4 flex flex-col shrink-0 z-10 shadow-sm relative">
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Drag Elements</h3>

                <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {AVAILABLE_WIDGETS.map(widget => (
                        <button
                            key={widget.type}
                            type="button"
                            onClick={() => addWidget(widget)}
                            className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg transition-colors text-left"
                        >
                            <span className="text-slate-400 group-hover:text-indigo-500">{widget.icon}</span>
                            {widget.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* MIDDLE: Canvas Area (A4 Paper) */}
            <div className="flex-1 overflow-auto bg-slate-200/50 p-8 flex justify-center items-start relative pb-32">
                <div
                    className="bg-white shadow-xl relative ring-1 ring-slate-200 select-none overflow-hidden"
                    style={{ width: `${A4_WIDTH_PX}px`, height: `${A4_HEIGHT_PX}px`, minHeight: `${A4_HEIGHT_PX}px`, minWidth: `${A4_WIDTH_PX}px` }}
                >
                    {/* Visual Grid for Alignment (Development aid, won't print) */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_10px]"></div>

                    {layout.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none">
                            <p>Click elements on the left to add them to the canvas.</p>
                        </div>
                    )}

                    {layout.map((block) => (
                        <Rnd
                            key={block.id}
                            className={`canvas-block group ${selectedBlockId === block.id ? 'ring-2 ring-indigo-500 z-50' : 'hover:ring-1 hover:ring-slate-300 z-10'}`}
                            bounds="parent"
                            size={{ width: block.config.width, height: block.config.height }}
                            position={{ x: block.config.x, y: block.config.y }}
                            onDragStart={() => setSelectedBlockId(block.id)}
                            onDragStop={(e, d) => {
                                updateBlockPositionAndSize(block.id, d.x, d.y, undefined, undefined);
                            }}
                            onResizeStart={() => setSelectedBlockId(block.id)}
                            onResizeStop={(e, direction, ref, delta, position) => {
                                updateBlockPositionAndSize(
                                    block.id,
                                    position.x,
                                    position.y,
                                    parseInt(ref.style.width, 10),
                                    parseInt(ref.style.height, 10)
                                );
                            }}
                            resizeHandleComponent={{
                                bottomRight: <div className={`w-3 h-3 bg-indigo-500 rounded-full border border-white translate-x-1.5 translate-y-1.5 ${selectedBlockId === block.id ? 'opacity-100' : 'opacity-0'}`} />
                            }}
                        >
                            {/* Render the block using InvoiceRenderer sharing the same logic */}
                            <div
                                className="w-full h-full overflow-hidden"
                                onMouseDown={() => setSelectedBlockId(block.id)}
                            >
                                <div className="absolute inset-0 pointer-events-none" /> {/* Prevents accidental rich-text selection while dragging */}
                                {renderBlock(block, dummyData, { isDesigner: true })}
                            </div>

                            {/* Delete Button */}
                            {selectedBlockId === block.id && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 focus:outline-none z-[100] cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </Rnd>
                    ))}
                </div>
            </div>

            {/* RIGHT SIDEBAR: Properties Inspector */}
            <div className="sidebar-controls w-80 bg-white border-l border-slate-200 p-6 flex flex-col shrink-0 z-10 shadow-sm overflow-y-auto custom-scrollbar">
                {selectedBlock ? (
                    <>
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                            <Settings size={18} className="text-slate-400" />
                            <h3 className="font-bold text-slate-800 text-sm">Properties</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                Type: {AVAILABLE_WIDGETS.find(w => w.type === selectedBlock.type)?.label || selectedBlock.type}
                            </div>

                            {/* Text Editor for Static Labels */}
                            {['STATIC_TEXT', 'INVOICE_TITLE_LABEL', 'BILL_TO_LABEL', 'NOTES_LABEL'].includes(selectedBlock.type) && (
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Text Value</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                        value={selectedBlock.config.text || ''}
                                        onChange={(e) => updateBlockConfig(selectedBlock.id, 'text', e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Font Size */}
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Font Size (px)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={selectedBlock.config.fontSize || 14}
                                    onChange={(e) => updateBlockConfig(selectedBlock.id, 'fontSize', parseInt(e.target.value) || 14)}
                                />
                            </div>

                            {/* Font Weight */}
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Font Weight</label>
                                <select
                                    className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={selectedBlock.config.fontWeight || 'normal'}
                                    onChange={(e) => updateBlockConfig(selectedBlock.id, 'fontWeight', e.target.value)}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="medium">Medium</option>
                                    <option value="bold">Bold</option>
                                    <option value="900">Black/Heavy</option>
                                </select>
                            </div>

                            {/* Alignment */}
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Text Alignment</label>
                                <div className="flex border border-slate-200 rounded overflow-hidden">
                                    {['left', 'center', 'right'].map(align => (
                                        <button
                                            key={align}
                                            onClick={() => updateBlockConfig(selectedBlock.id, 'textAlign', align)}
                                            className={`flex-1 py-1.5 text-xs font-medium capitalize border-r border-slate-200 last:border-0 ${selectedBlock.config.textAlign === align ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {align}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ITEMS_TABLE Columns Editor */}
                            {selectedBlock.type === 'ITEMS_TABLE' && (
                                <div className="mt-6 border-t border-slate-200 pt-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Table Columns</label>
                                    <div className="space-y-3">
                                        {(selectedBlock.config.columns || []).map((col, idx) => (
                                            <div key={col.id || idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex flex-col gap-2 relative group">
                                                <button
                                                    onClick={() => {
                                                        const newCols = selectedBlock.config.columns.filter((_, i) => i !== idx);
                                                        updateBlockConfig(selectedBlock.id, 'columns', newCols);
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                                >
                                                    <X size={12} />
                                                </button>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Header Label</label>
                                                        <input
                                                            type="text"
                                                            className="w-full p-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                                            value={col.label}
                                                            onChange={(e) => {
                                                                const newCols = [...(selectedBlock.config.columns || [])];
                                                                newCols[idx] = { ...col, label: e.target.value };
                                                                updateBlockConfig(selectedBlock.id, 'columns', newCols);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Data Key</label>
                                                        <input
                                                            type="text"
                                                            className="w-full p-1.5 border border-slate-200 rounded font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                                                            value={col.key}
                                                            onChange={(e) => {
                                                                const newCols = [...(selectedBlock.config.columns || [])];
                                                                newCols[idx] = { ...col, key: e.target.value };
                                                                updateBlockConfig(selectedBlock.id, 'columns', newCols);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                                            checked={!!col.isCurrency}
                                                            onChange={(e) => {
                                                                const newCols = [...(selectedBlock.config.columns || [])];
                                                                newCols[idx] = { ...col, isCurrency: e.target.checked };
                                                                updateBlockConfig(selectedBlock.id, 'columns', newCols);
                                                            }}
                                                        /> Currency Format
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => {
                                            const fallbackCols = [
                                                { id: 'col_desc', key: 'description', label: 'Item Description', align: 'left', width: 'auto' },
                                                { id: 'col_qty', key: 'quantity', label: 'Qty', align: 'center', width: '80px' },
                                                { id: 'col_price', key: 'price', label: 'Price', align: 'right', isCurrency: true, width: '120px' },
                                                { id: 'col_total', key: 'total', label: 'Total', align: 'right', isCurrency: true, width: '120px' }
                                            ];
                                            const currentConfigCols = selectedBlock.config.columns || fallbackCols;
                                            const newCols = [...currentConfigCols, { id: `col_${Date.now()}`, key: 'custom_field', label: 'New Column', align: 'left', width: 'auto' }];
                                            updateBlockConfig(selectedBlock.id, 'columns', newCols);
                                        }}
                                        className="w-full py-2 text-xs font-bold border-2 border-dashed border-indigo-200 text-indigo-600 rounded-lg mt-3 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 transition-colors"
                                    >
                                        + Add Table Column
                                    </button>
                                </div>
                            )}

                            {/* Color */}
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Text Color</label>
                                <input
                                    type="color"
                                    className="w-full h-8 cursor-pointer rounded border border-slate-200"
                                    value={selectedBlock.config.color || '#1e293b'}
                                    onChange={(e) => updateBlockConfig(selectedBlock.id, 'color', e.target.value)}
                                />
                            </div>

                            {/* Background Color */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs text-slate-500">Background Color</label>
                                    {selectedBlock.config.backgroundColor && selectedBlock.config.backgroundColor !== 'transparent' && (
                                        <button
                                            onClick={() => updateBlockConfig(selectedBlock.id, 'backgroundColor', 'transparent')}
                                            className="text-[10px] text-red-500 hover:underline"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="color"
                                    className="w-full h-8 cursor-pointer rounded border border-slate-200"
                                    value={selectedBlock.config.backgroundColor && selectedBlock.config.backgroundColor !== 'transparent' ? selectedBlock.config.backgroundColor : '#ffffff'}
                                    onChange={(e) => updateBlockConfig(selectedBlock.id, 'backgroundColor', e.target.value)}
                                />
                            </div>

                            {/* Dimensions (Read Only roughly) */}
                            <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-slate-100">
                                <div>
                                    <label className="block text-[10px] text-slate-400 mb-1 uppercase">Width</label>
                                    <div className="text-sm font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-600">{Math.round(selectedBlock.config.width)}px</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-400 mb-1 uppercase">Height</label>
                                    <div className="text-sm font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-600">{Math.round(selectedBlock.config.height)}px</div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-3">
                        <Settings size={32} className="text-slate-300 mx-auto" />
                        <p className="text-sm font-medium text-slate-500">Select an element on the canvas to edit its properties</p>
                    </div>
                )}
            </div>
        </div>
    );
}
