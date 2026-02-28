import React from 'react';

const mmToPx = 3.7795275591;
const A4_WIDTH_PX = 210 * mmToPx;
const A4_HEIGHT_PX = 297 * mmToPx;

export const renderBlock = (block, data, options = {}) => {
    const {
        invoiceData,
        companyConfig,
        taxRate,
        calculateSubtotal,
        tax,
        total,
    } = data;

    // Default styling explicitly extracted
    const { fontSize = 14, fontWeight = 'normal', textAlign = 'left', color = '#1e293b', backgroundColor = 'transparent', text = '' } = block.config || {};

    // Construct style object dynamically based on config
    const customStyle = {
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight,
        textAlign: textAlign,
        color: color,
        backgroundColor: backgroundColor,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    };

    switch (block.type) {

        // ---------------- TEXT ELEMENTS ----------------
        case 'STATIC_TEXT':
        case 'INVOICE_TITLE_LABEL':
        case 'BILL_TO_LABEL':
        case 'NOTES_LABEL':
            return <div style={customStyle}>{text}</div>;

        // ---------------- DYNAMIC ELEMENTS ----------------
        case 'COMPANY_NAME':
            return <div style={customStyle}>{companyConfig?.name || 'Your Company Name'}</div>;

        case 'COMPANY_DETAILS':
            return (
                <div style={customStyle}>
                    {companyConfig?.address || 'Your Business Address'}<br />
                    {companyConfig?.email && <>{companyConfig.email}<br /></>}
                    {companyConfig?.phone && <>{companyConfig.phone}<br /></>}
                    {companyConfig?.website && <>{companyConfig.website}</>}
                </div>
            );

        case 'CUSTOMER_DETAILS':
            return (
                <div style={customStyle}>
                    <div style={{ fontWeight: 'bold' }}>{invoiceData.customerName || 'Customer Name'}</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{invoiceData.clientAddress || 'Client Address...'}</div>
                    {invoiceData.gstNumber && (
                        <div style={{ marginTop: '8px' }}>
                            <span style={{ fontWeight: '600' }}>GSTIN: </span>
                            {invoiceData.gstNumber}
                        </div>
                    )}
                </div>
            );

        case 'INVOICE_DETAILS':
            return (
                <div style={customStyle}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold uppercase opacity-80 text-[0.8em]">Invoice #</span>
                        <span>{invoiceData.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold uppercase opacity-80 text-[0.8em]">Date</span>
                        <span>{invoiceData.date}</span>
                    </div>
                    {invoiceData.dueDate && (
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold uppercase opacity-80 text-[0.8em]">Due Date</span>
                            <span>{invoiceData.dueDate}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="font-bold uppercase opacity-80 text-[0.8em]">Status</span>
                        <span className={`px-2 py-0.5 rounded text-[0.85em] font-bold ${invoiceData.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {invoiceData.status}
                        </span>
                    </div>
                </div>
            );

        case 'LOGO':
            return (
                <div style={{ ...customStyle, display: 'flex', alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start', justifyContent: 'center' }}>
                    {companyConfig?.logo ? (
                        <img src={companyConfig.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs rounded border border-slate-200">
                            No Logo
                        </div>
                    )}
                </div>
            );

        case 'ITEMS_TABLE': {
            const columns = block.config?.columns || [
                { id: 'col_desc', key: 'description', label: 'Item Description', align: 'left', width: 'auto' },
                { id: 'col_qty', key: 'quantity', label: 'Qty', align: 'center', width: '80px' },
                { id: 'col_price', key: 'price', label: 'Price', align: 'right', isCurrency: true, width: '120px' },
                { id: 'col_total', key: 'total', label: 'Total', align: 'right', isCurrency: true, width: '120px' }
            ];

            return (
                <div style={{ ...customStyle, overflow: 'visible' }}>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-800 text-white">
                                {columns.map(col => (
                                    <th key={col.id} className={`py-2 px-3 text-${col.align} font-semibold text-sm`} style={{ width: col.width || 'auto' }}>
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100" style={{ backgroundColor: 'inherit' }}>
                            {invoiceData.items.map((item, i) => (
                                <tr key={i} className="border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                                    {columns.map(col => (
                                        <td key={col.id} className={`py-3 px-3 text-sm text-${col.align} ${col.key === 'description' ? 'font-medium' : ''} ${col.key === 'total' ? 'font-bold' : ''}`}>
                                            {col.isCurrency ? '₹' : ''}
                                            {typeof item[col.key] === 'number' && col.isCurrency ? item[col.key].toFixed(2) : (item[col.key] || '')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        case 'TOTALS':
            return (
                <div style={{ ...customStyle, justifyContent: 'flex-start' }}>
                    <div className="bg-slate-50 p-4 rounded border border-slate-100 flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                            <span className="opacity-80">Subtotal</span>
                            <span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="opacity-80">Tax ({taxRate}%)</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-slate-200 my-1"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold">Grand Total</span>
                            <span className="text-lg font-bold">₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            );

        case 'NOTES_CONTENT':
            return (
                <div style={{ ...customStyle, whiteSpace: 'pre-wrap' }}>
                    {invoiceData.notes || 'Thank you for your business! Payment is expected by the due date.'}
                </div>
            );

        case 'CUSTOM_ATTRIBUTES':
            return (
                <div style={{ ...customStyle }} className="grid grid-cols-2 gap-3">
                    {invoiceData.customAttributes && invoiceData.customAttributes.length > 0 ? (
                        invoiceData.customAttributes.map((attr, idx) => (
                            <div key={idx} className="flex flex-col bg-slate-50 p-2 rounded border border-slate-100">
                                <span className="text-[0.7rem] font-bold uppercase opacity-70 tracking-wider">{attr.key}</span>
                                <span className="text-sm font-medium break-all">{attr.value}</span>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-sm opacity-50 border border-dashed border-slate-200 p-2 rounded text-center">
                            No Custom Attributes Added Yet
                        </div>
                    )}
                </div>
            );

        // ---------------- OLD LEGACY BLOCKS (Backwards Compatibility) ----------------
        case 'HEADER_BLOCK': {
            return (
                <div key={block.id} className={`flex flex-col gap-4 mb-4 w-full`}>
                    {companyConfig?.logo ? (
                        <img src={companyConfig.logo} alt="Company Logo" className={`h-16 object-contain w-full max-w-[150px] object-left`} />
                    ) : (
                        <div className="h-16 w-32 bg-slate-100 flex items-center justify-center text-slate-400 text-xs rounded border border-slate-200">
                            No Logo
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{companyConfig?.name || 'Your Company Name'}</h2>
                        <div className="text-sm text-slate-500 mt-1">
                            {companyConfig?.address}<br />
                            {companyConfig?.phone}
                        </div>
                    </div>
                </div>
            );
        }

        case 'INVOICE_TITLE': {
            return (
                <div key={block.id} className={`mb-4 w-full text-right`}>
                    <h1 className="text-3xl font-black text-slate-200 tracking-tighter mb-2 uppercase">INVOICE</h1>
                    <div className={`inline-block text-left bg-slate-50 border border-slate-100 p-3 rounded min-w-[180px] ml-auto`}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-bold text-slate-400">Invoice #</span>
                            <span className="font-bold">{invoiceData.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-400">Date</span>
                            <span>{invoiceData.date}</span>
                        </div>
                    </div>
                </div>
            );
        }

        case 'BILL_TO_BLOCK':
            return (
                <div key={block.id} className="flex gap-8 mb-4 py-4 w-full bg-slate-50/50">
                    <div className="flex-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Bill To</span>
                        <h3 className="font-bold text-slate-800">{invoiceData.customerName || 'Customer Name'}</h3>
                        <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">{invoiceData.clientAddress}</p>
                    </div>
                </div>
            );

        case 'NOTES_BLOCK':
            return (
                <div key={block.id} className="mt-4 pt-4 border-t border-slate-200 w-full">
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Terms & Notes</h4>
                    <p className="text-sm text-slate-500 whitespace-pre-wrap">
                        {invoiceData.notes || 'Thank you for your business!'}
                    </p>
                </div>
            );

        case 'TOTALS_BLOCK': {
            return (
                <div key={block.id} className="mt-4 border-t border-slate-200 pt-4 w-full flex justify-end">
                    <div className="w-1/2 min-w-[250px] bg-slate-50 p-4 rounded ml-auto">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-500">Subtotal</span>
                            <span className="font-medium text-slate-800">
                                ₹{calculateSubtotal().toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-slate-500">Tax ({taxRate}%)</span>
                            <span className="font-medium text-slate-800">
                                ₹{tax.toFixed(2)}
                            </span>
                        </div>
                        <div className="h-px bg-slate-200 my-2"></div>
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-bold text-slate-800">Total</span>
                            <span className="font-black text-slate-900">
                                ₹{total.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        case 'CUSTOM_TEXT':
            return (
                <div key={block.id} className="my-2 w-full">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{block.config?.text || 'Custom Text'}</p>
                </div>
            );

        default:
            return <div style={{ ...customStyle, border: '1px solid red', color: 'red' }}>Unknown: {block.type}</div>;
    }
};

export default function InvoiceRenderer({ layout, invoiceData, companyConfig, taxRate, calculateSubtotal, tax, total }) {

    // Default template if empty (Free-form mapped positions)
    // Clean template if empty (Free-form mapped positions)
    const activeLayout = layout && layout.length > 0 ? layout : [];

    const dataPayload = { invoiceData, companyConfig, taxRate, calculateSubtotal, tax, total };

    return (
        <div
            className="bg-white shadow-lg relative text-slate-900 print:shadow-none print:w-[210mm] print:h-[297mm] overflow-hidden"
            style={{ width: `${A4_WIDTH_PX}px`, height: `${A4_HEIGHT_PX}px` }}
        >
            {/* Top Accent Bar (Can be made a drag widget later if desired, keeping static for now) */}
            <div className="h-4 w-full bg-indigo-900 absolute top-0 left-0"></div>

            {/* Render Canvas Elements via absolute positioning */}
            {activeLayout.map(block => (
                <div
                    key={block.id}
                    style={{
                        position: 'absolute',
                        left: `${block.config.x}px`,
                        top: `${block.config.y}px`,
                        width: `${block.config.width}px`,
                        height: `${block.config.height}px`
                    }}
                >
                    {renderBlock(block, dataPayload, { isDesigner: false })}
                </div>
            ))}
        </div>
    );
}
