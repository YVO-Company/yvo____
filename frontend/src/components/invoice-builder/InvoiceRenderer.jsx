import React from 'react';

// Renders individual blocks based on the layout JSON
export const renderBlock = (block, data, options = {}) => {
    const {
        invoiceData,
        companyConfig,
        taxRate,
        calculateSubtotal,
        tax,
        total,
    } = data;

    switch (block.type) {
        case 'HEADER_BLOCK': {
            const align = block.config?.align || 'left';
            const alignClass = align === 'center' ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start text-left';
            const logoAlignClass = align === 'center' ? 'object-center' : align === 'right' ? 'object-right' : 'object-left';

            return (
                <div key={block.id} className={`flex flex-col gap-4 mb-10 w-full ${alignClass}`}>
                    {companyConfig?.logo ? (
                        <img src={companyConfig.logo} alt="Company Logo" className={`h-20 object-contain w-full max-w-[200px] ${logoAlignClass}`} />
                    ) : (
                        <div className="h-20 w-40 bg-slate-100 flex items-center justify-center text-slate-400 text-xs rounded border border-slate-200">
                            No Logo Uploaded
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{companyConfig?.name || 'Your Company Name'}</h2>
                        <div className="text-sm text-slate-500 leading-relaxed mt-1">
                            {companyConfig?.address || 'Your Business Address'}<br />
                            {companyConfig?.email && <>{companyConfig.email}<br /></>}
                            {companyConfig?.phone && <>{companyConfig.phone}<br /></>}
                            {companyConfig?.website && <>{companyConfig.website}</>}
                        </div>
                    </div>
                </div>
            );
        }

        case 'INVOICE_TITLE': {
            const align = block.config?.align || 'right';
            const alignClass = align === 'center' ? 'text-center' : align === 'left' ? 'text-left' : 'text-right';
            const blockAlignClass = align === 'center' ? 'mx-auto' : align === 'left' ? 'mr-auto' : 'ml-auto';

            return (
                <div key={block.id} className={`mb-10 w-full ${alignClass}`}>
                    <h1 className="text-5xl font-black text-slate-100 tracking-tighter mb-4 uppercase">INVOICE</h1>
                    <div className={`inline-block text-left bg-slate-50 border border-slate-100 p-4 rounded-lg min-w-[200px] ${blockAlignClass}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Invoice #</span>
                            <span className="font-mono font-bold text-slate-800">{invoiceData.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Date</span>
                            <span className="text-sm font-medium text-slate-700">{invoiceData.date}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${invoiceData.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {invoiceData.status}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        case 'BILL_TO_BLOCK':
            return (
                <div key={block.id} className="flex gap-12 mb-12 border-t border-b border-slate-100 py-8">
                    <div className="flex-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Bill To</span>
                        <h3 className="font-bold text-lg text-slate-800">{invoiceData.customerName || 'Customer Name'}</h3>
                        <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap leading-relaxed">
                            {invoiceData.clientAddress || 'Client Address...'}
                        </p>
                        {invoiceData.gstNumber && (
                            <div className="mt-3 text-sm flex items-center gap-2">
                                <span className="font-semibold text-slate-600">GSTIN:</span>
                                <span className="font-mono text-slate-800">{invoiceData.gstNumber}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        {invoiceData.dueDate && (
                            <>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Payment Due</span>
                                <div className="font-medium text-slate-800">{invoiceData.dueDate}</div>
                                <p className="text-xs text-slate-400 mt-1">Please pay by due date to avoid late fees.</p>
                            </>
                        )}
                    </div>
                </div>
            );

        case 'ITEMS_TABLE':
            return (
                <table key={block.id} className="w-full mb-8">
                    <thead>
                        <tr className="bg-slate-800 text-white">
                            <th className="py-3 px-4 text-left font-semibold text-sm rounded-l-lg">Item Description</th>
                            <th className="py-3 px-4 text-center font-semibold text-sm w-24">Qty</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm w-32">Price</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm w-32 rounded-r-lg">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoiceData.items.map((item, i) => (
                            <tr key={i} className="group hover:bg-slate-50 border-b border-slate-100">
                                <td className="py-4 px-4 text-sm text-slate-700 font-medium">{item.description || 'Item description'}</td>
                                <td className="py-4 px-4 text-sm text-center text-slate-600">{item.quantity}</td>
                                <td className="py-4 px-4 text-sm text-right text-slate-600">₹{item.price.toFixed(2)}</td>
                                <td className="py-4 px-4 text-sm text-right font-bold text-slate-800">₹{item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );

        case 'TOTALS_BLOCK':
            return (
                <div key={block.id} className="flex justify-end mb-8">
                    <div className="w-80 bg-slate-50 rounded-lg p-6 space-y-3 border border-slate-100">
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-slate-500 font-medium">Subtotal</span>
                            <span className="font-semibold text-slate-800">₹{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-slate-500 font-medium">Tax ({taxRate}%)</span>
                            <span className="text-slate-800">₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-slate-200 my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-base font-bold text-indigo-900">Grand Total</span>
                            <span className="text-xl font-bold text-indigo-900">₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            );

        case 'NOTES_BLOCK':
            return (
                <div key={block.id} className="mt-8 pt-8 border-t border-slate-200">
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Terms & Notes</h4>
                    <p className="text-sm text-slate-500 leading-relaxed italic whitespace-pre-wrap">
                        {invoiceData.notes || 'Thank you for your business! Payment is expected by the due date.'}
                    </p>
                </div>
            );

        case 'CUSTOM_TEXT':
            return (
                <div key={block.id} className="my-6">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{block.config?.text || 'Example Custom Text'}</p>
                </div>
            );

        default:
            return <div key={block.id} className="p-4 border border-red-500 text-red-500">Unknown block: {block.type}</div>;
    }
};

export default function InvoiceRenderer({ layout, invoiceData, companyConfig, taxRate, calculateSubtotal, tax, total }) {
    // If no layout is provided, fallback to standard layout
    const activeLayout = layout && layout.length > 0 ? layout : [
        { id: '1', type: 'HEADER_BLOCK' },
        { id: '2', type: 'INVOICE_TITLE' },
        { id: '3', type: 'BILL_TO_BLOCK' },
        { id: '4', type: 'ITEMS_TABLE' },
        { id: '5', type: 'TOTALS_BLOCK' },
        { id: '6', type: 'NOTES_BLOCK' }
    ];

    const dataPayload = { invoiceData, companyConfig, taxRate, calculateSubtotal, tax, total };

    // Grouping logic: Header and Title are side-by-side in the default layout
    const headerBlock = activeLayout.find(b => b.type === 'HEADER_BLOCK');
    const titleBlock = activeLayout.find(b => b.type === 'INVOICE_TITLE');
    const otherBlocks = activeLayout.filter(b => b.type !== 'HEADER_BLOCK' && b.type !== 'INVOICE_TITLE');

    return (
        <div className="w-full max-w-[210mm] bg-white shadow-lg min-h-[297mm] text-slate-900 print:shadow-none print:w-full relative overflow-hidden">
            {/* Top Accent Bar */}
            <div className="h-4 w-full bg-indigo-900 absolute top-0 left-0"></div>

            <div className="p-[10mm] pt-[15mm]">
                {/* Special handling for the top section if both header and title exist to maintain the side-by-side look *ONLY IF* they are the first two blocks and standard alignment is used */}
                {(headerBlock && titleBlock && headerBlock.config?.align !== 'center' && titleBlock.config?.align !== 'center' && titleBlock.config?.align !== 'left') ? (
                    <div className="flex justify-between items-start mb-10 w-full">
                        <div className="flex-1 max-w-[60%] flex">
                            {renderBlock(headerBlock, dataPayload)}
                        </div>
                        <div className="flex-1 max-w-[40%] flex justify-end">
                            {renderBlock(titleBlock, dataPayload)}
                        </div>
                    </div>
                ) : (
                    <>
                        {headerBlock && renderBlock(headerBlock, dataPayload)}
                        {titleBlock && renderBlock(titleBlock, dataPayload)}
                    </>
                )}

                {/* Render the rest */}
                {otherBlocks.map(block => renderBlock(block, dataPayload))}
            </div>
        </div>
    );
}
