import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, X, Type, Image, AlignLeft, Hash, DollarSign, FileText } from 'lucide-react';
import { renderBlock } from './InvoiceRenderer';

const AVAILABLE_BLOCKS = [
    { type: 'HEADER_BLOCK', label: 'Company Header (Logo & Name)', icon: <Image size={16} /> },
    { type: 'INVOICE_TITLE', label: 'Invoice Title & Number', icon: <Hash size={16} /> },
    { type: 'BILL_TO_BLOCK', label: 'Bill To (Customer Details)', icon: <AlignLeft size={16} /> },
    { type: 'ITEMS_TABLE', label: 'Items Table', icon: <FileText size={16} /> },
    { type: 'TOTALS_BLOCK', label: 'Totals & Tax', icon: <DollarSign size={16} /> },
    { type: 'NOTES_BLOCK', label: 'Notes & Terms', icon: <Type size={16} /> },
    { type: 'CUSTOM_TEXT', label: 'Custom Text', icon: <Type size={16} /> },
];

const dummyData = {
    invoiceData: {
        invoiceNumber: 'INV-2024-001',
        date: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'PENDING',
        customerName: 'Acme Corp',
        clientAddress: '123 Business Rd\nTech City, TC 12345',
        gstNumber: '22AAAAA0000A1Z5',
        notes: 'Thank you for your business. Please remit payment within 7 days.',
        items: [
            { description: 'Web Development Services', quantity: 1, price: 1500, total: 1500 },
            { description: 'Annual Hosting', quantity: 1, price: 120, total: 120 }
        ]
    },
    companyConfig: {
        name: 'Your Company Name',
        address: '456 Startup Blvd\nInnovation District',
        email: 'hello@yourcompany.com',
        phone: '+1 (555) 123-4567',
        website: 'www.yourcompany.com'
    },
    taxRate: 10,
    calculateSubtotal: () => 1620,
    tax: 162,
    total: 1782
};

export default function TemplateDesigner({ value, onChange }) {
    // value is the layout JSON array from InvoiceTemplate
    const [layout, setLayout] = useState(value || []);

    // Sync upward
    useEffect(() => {
        onChange(layout);
    }, [layout]);

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(layout);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setLayout(items);
    };

    const addBlock = (blockType) => {
        const newBlock = {
            id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: blockType,
            config: {} // Default config
        };
        setLayout([...layout, newBlock]);
    };

    const removeBlock = (id) => {
        setLayout(layout.filter(b => b.id !== id));
    };

    const updateBlockConfig = (id, key, val) => {
        setLayout(layout.map(b => b.id === id ? { ...b, config: { ...b.config, [key]: val } } : b));
    };

    return (
        <div className="flex gap-6 h-[600px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            {/* Sidebar Controls */}
            <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col shrink-0">
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Available Blocks</h3>
                <div className="space-y-2 flex-1 overflow-y-auto">
                    {AVAILABLE_BLOCKS.map(block => (
                        <button
                            key={block.type}
                            type="button"
                            onClick={() => addBlock(block.type)}
                            className="w-full flex items-center gap-3 p-3 text-sm text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg transition-colors text-left"
                        >
                            <span className="text-slate-400 group-hover:text-indigo-500">{block.icon}</span>
                            {block.label}
                        </button>
                    ))}
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4">
                    <p className="text-xs text-slate-500 text-center">Click a block to add it to your invoice layout.</p>
                </div>
            </div>

            {/* Canvas Area (A4 Paper scale) */}
            <div className="flex-1 p-6 overflow-y-auto flex justify-center bg-slate-200/50">
                <div className="w-full max-w-[210mm] bg-white shadow-sm min-h-[297mm] relative overflow-hidden ring-1 ring-slate-200">
                    {/* Top Accent Bar */}
                    <div className="h-4 w-full bg-indigo-900 absolute top-0 left-0"></div>

                    <div className="p-8 pt-12 min-h-full">
                        {layout.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 m-8 rounded-xl bg-slate-50/50">
                                <p>No blocks added. Click a block on the left to start building your actual layout.</p>
                            </div>
                        ) : (
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="canvas">
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-full pb-32">
                                            {layout.map((block, index) => {
                                                const blockInfo = AVAILABLE_BLOCKS.find(b => b.type === block.type) || { label: 'Unknown Block' };
                                                return (
                                                    <Draggable key={block.id} draggableId={block.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`relative group border-2 rounded transition-colors -mx-4 px-4 py-2 ${snapshot.isDragging ? 'border-indigo-500 shadow-xl z-50 bg-white/90 backdrop-blur scale-[1.02]' : 'border-transparent hover:border-indigo-100'
                                                                    }`}
                                                            >
                                                                {/* Drag Handle & Config Overlay */}
                                                                <div className={`absolute -left-12 top-2 transition-opacity flex flex-col gap-2 items-center bg-white shadow-md border border-slate-200 rounded-md p-1 z-10 ${snapshot.isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                                    <div {...provided.dragHandleProps} className="p-1.5 text-slate-400 hover:text-slate-800 cursor-grab hover:bg-slate-50 rounded">
                                                                        <GripVertical size={16} />
                                                                    </div>
                                                                    <div className="w-full h-px bg-slate-100"></div>
                                                                    <button type="button" onPointerDown={(e) => { e.stopPropagation(); removeBlock(block.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Remove Block">
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>

                                                                {/* Config Ribbon (if applicable) */}
                                                                {(block.type === 'HEADER_BLOCK' || block.type === 'INVOICE_TITLE') && (
                                                                    <div className={`absolute -top-8 right-0 bg-white shadow-md border border-slate-200 rounded-md py-1 px-2 flex items-center gap-2 z-10 transition-opacity ${snapshot.isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Align:</span>
                                                                        <select
                                                                            className="py-0.5 px-1 text-xs border border-transparent hover:border-slate-200 rounded focus:outline-none"
                                                                            value={block.config?.align || (block.type === 'HEADER_BLOCK' ? 'left' : 'right')}
                                                                            onChange={(e) => updateBlockConfig(block.id, 'align', e.target.value)}
                                                                        >
                                                                            <option value="left">Left</option>
                                                                            <option value="center">Center</option>
                                                                            <option value="right">Right</option>
                                                                        </select>
                                                                    </div>
                                                                )}

                                                                {block.type === 'CUSTOM_TEXT' && (
                                                                    <div className={`absolute -top-8 right-0 bg-white shadow-md border border-slate-200 rounded-md py-1 px-2 flex items-center gap-2 z-10 transition-opacity ${snapshot.isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Edit Text:</span>
                                                                        <input
                                                                            type="text"
                                                                            className="py-0.5 px-1 w-32 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
                                                                            placeholder="Type here..."
                                                                            value={block.config?.text || ''}
                                                                            onChange={(e) => updateBlockConfig(block.id, 'text', e.target.value)}
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Render Actual Block */}
                                                                <div className="pointer-events-none w-full">
                                                                    {renderBlock(block, dummyData)}
                                                                </div>

                                                                {/* Overlay to prevent accidental clicks on rendered generic static text */}
                                                                <div className="absolute inset-0 bg-transparent" />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
