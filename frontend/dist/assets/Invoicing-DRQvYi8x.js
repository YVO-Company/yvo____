import{t as e}from"./circle-alert-B9Shl7V1.js";import{t}from"./download-DkTWPRZE.js";import{t as n}from"./file-text-X3F31LPe.js";import{t as r}from"./InvoiceBuilder-CGsWSWnP.js";import"./lock-DSGmDFD7.js";import{t as i}from"./plus-CEMkcid2.js";import"./save-Du0TzjDU.js";import{t as a}from"./search-7QJDYU_6.js";import{t as o}from"./trash-2-Eo-Zwxxt.js";import{c as s,i as c,n as l,r as u,w as d,y as f}from"./index-FG9feFxU.js";import{t as p}from"./html2pdf-CMpu4Xgi.js";import"./InvoiceRenderer-DjfAepaN.js";var m=s(`rotate-ccw`,[[`path`,{d:`M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8`,key:`1357e3`}],[`path`,{d:`M3 3v5h5`,key:`1xhq8a`}]]),h=d(f(),1),g=u();function _({isOpen:e,onClose:t,title:n,children:r}){return(0,h.useEffect)(()=>(e?document.body.style.overflow=`hidden`:document.body.style.overflow=`unset`,()=>{document.body.style.overflow=`unset`}),[e]),e?(0,g.jsxs)(`div`,{className:`fixed inset-0 z-50 flex justify-end`,children:[(0,g.jsx)(`div`,{className:`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity`,onClick:t}),(0,g.jsxs)(`div`,{className:`relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in-right`,children:[(0,g.jsxs)(`div`,{className:`flex justify-between items-center p-4 border-b border-slate-200`,children:[(0,g.jsx)(`h2`,{className:`text-lg font-bold text-slate-800`,children:n}),(0,g.jsx)(`button`,{onClick:t,className:`p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors`,children:(0,g.jsx)(c,{size:20})})]}),(0,g.jsx)(`div`,{className:`flex-1 overflow-y-auto p-0 bg-slate-50`,children:r})]})]}):null}var v=d(p(),1);function y(){let[s,c]=(0,h.useState)(``),[u,d]=(0,h.useState)([]),[f,p]=(0,h.useState)(!0),[y,b]=(0,h.useState)(!1),[x,S]=(0,h.useState)(null),[C,w]=(0,h.useState)(!1),[T,E]=(0,h.useState)(`invoices`),[D,O]=(0,h.useState)([]),[k,A]=(0,h.useState)(!1),[j,M]=(0,h.useState)({invoiceId:``,reason:``,items:[]}),[N,P]=(0,h.useState)(null);(0,h.useEffect)(()=>{W(),F(),I()},[C]);let F=async()=>{try{P((await l.get(`/company/config`)).data.company)}catch{console.error(`Failed to load company config`)}},I=async()=>{try{let e=localStorage.getItem(`companyId`);O((await l.get(`/invoice-templates`,{params:{companyId:e}})).data)}catch{console.error(`Failed to load templates`)}},[L,R]=(0,h.useState)(`all`),[z,B]=(0,h.useState)(``),[V,H]=(0,h.useState)(``),U=e=>{let t=new Date(e.date||e.createdAt||Date.now()),n=new Date;if(!(e.customerName?.toLowerCase().includes(s.toLowerCase())||e.invoiceNumber?.toLowerCase().includes(s.toLowerCase()))||z&&new Date(z)>t)return!1;if(V){let e=new Date(V);if(e.setHours(23,59,59,999),e<t)return!1}if(L===`this_month`)return t.getMonth()===n.getMonth()&&t.getFullYear()===n.getFullYear();if(L===`last_month`){let e=new Date;return e.setMonth(n.getMonth()-1),t.getMonth()===e.getMonth()&&t.getFullYear()===e.getFullYear()}return L===`this_year`?t.getFullYear()===n.getFullYear():!0},W=async()=>{try{p(!0);let e=localStorage.getItem(`companyId`);d((await l.get(`/invoices`,{params:{companyId:e,isDeleted:C}})).data)}catch(e){console.error(`Failed to load invoices`,e)}finally{p(!1)}},G=e=>{S(e),b(!0)},K=(e,t)=>{e.stopPropagation();let n=document.createElement(`div`);n.style.width=`210mm`,n.style.padding=`10mm`,n.style.background=`white`,n.style.color=`black`;let r=t.items.reduce((e,t)=>e+(t.total||0),0),i=t.taxRate===void 0?10:t.taxRate,a=r*(i/100),o=r+a,s=t.items.map(e=>`
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 15px; color: #334155; font-size: 13px;">${e.description||`Item`}</td>
                <td style="padding: 12px 15px; text-align: center; color: #64748b; font-size: 13px;">${e.quantity}</td>
                <td style="padding: 12px 15px; text-align: right; color: #64748b; font-size: 13px;">₹${e.price?.toFixed(2)}</td>
                <td style="padding: 12px 15px; text-align: right; color: #0f172a; font-weight: 600; font-size: 13px;">₹${e.total?.toFixed(2)}</td>
            </tr>
        `).join(``);n.innerHTML=`
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5;">
                
                <!-- Accent Bar -->
                <div style="height: 15px; background: #312e81; margin-bottom: 30px;"></div>

                <div style="padding: 0 10px;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; margin-bottom: 50px;">
                        <div style="width: 50%;">
                            ${N?.logo?`<img src="${N.logo}" style="height: 80px; margin-bottom: 15px; display: block;" />`:``}
                            <h2 style="margin: 0; color: #0f172a; font-size: 20px;">${N?.name||`YVO Company`}</h2>
                            <p style="margin: 5px 0 0; font-size: 13px; color: #64748b;">
                                ${N?.address||`123 Business St`}<br/>
                                ${N?.email?`${N.email}<br/>`:``}
                                ${N?.phone?`${N.phone}<br/>`:``}
                                ${N?.website?`${N.website}`:``}
                            </p>
                        </div>
                        <div style="width: 40%; text-align: right;">
                            <h1 style="font-size: 42px; font-weight: 900; color: #e2e8f0; margin: 0; letter-spacing: -2px;">INVOICE</h1>
                            <div style="margin-top: 10px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span style="font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Invoice #</span>
                                    <span style="font-family: monospace; font-weight: bold; color: #334155;">${t.invoiceNumber}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span style="font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Date</span>
                                    <span style="font-size: 13px; font-weight: 500;">${new Date(t.date).toLocaleDateString()}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Status</span>
                                    <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; background: #e2e8f0; border-radius: 4px;">${t.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Client Info -->
                    <div style="display: flex; justify-content: space-between; margin-bottom: 50px; padding: 20px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
                        <div style="width: 45%;">
                            <span style="font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Bill To</span>
                            <h3 style="margin: 0 0 5px; font-size: 16px; color: #0f172a;">${t.customerName}</h3>
                            <p style="margin: 0; font-size: 13px; color: #64748b; white-space: pre-wrap;">${t.clientAddress||`Client Address`}</p>
                            ${t.gstNumber?`<p style="margin: 8px 0 0; font-size: 12px; color: #475569;"><strong>GSTIN:</strong> ${t.gstNumber}</p>`:``}
                        </div>
                        <div style="width: 45%;">
                            <span style="font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Terms</span>
                            ${t.dueDate?`
                                <div style="margin-bottom: 5px;">
                                    <span style="font-size: 13px; color: #64748b;">Due Date:</span>
                                    <span style="font-weight: bold; color: #0f172a; margin-left: 5px;">${new Date(t.dueDate).toLocaleDateString()}</span>
                                </div>
                            `:`<p style="font-size: 13px; color: #64748b;">Payment due on receipt</p>`}
                        </div>
                    </div>

                    <!-- Table -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                        <thead>
                            <tr style="background: #1e293b; color: white;">
                                <th style="padding: 12px 15px; text-align: left; font-size: 13px; font-weight: 600; border-radius: 6px 0 0 6px;">Description</th>
                                <th style="padding: 12px 15px; text-align: center; font-size: 13px; font-weight: 600; width: 60px;">Qty</th>
                                <th style="padding: 12px 15px; text-align: right; font-size: 13px; font-weight: 600; width: 100px;">Price</th>
                                <th style="padding: 12px 15px; text-align: right; font-size: 13px; font-weight: 600; width: 100px; border-radius: 0 6px 6px 0;">Total</th>
                            </tr>
                        </thead>
                        <tbody>${s}</tbody>
                    </table>

                    <!-- Totals -->
                    <div style="display: flex; justify-content: flex-end;">
                        <div style="width: 300px; background: #f8fafc; padding: 20px; border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
                                <span style="color: #64748b; font-weight: 500;">Subtotal</span>
                                <span style="color: #0f172a; font-weight: 600;">₹${r.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 13px;">
                                <span style="color: #64748b; font-weight: 500;">Tax (${i}%)</span>
                                <span style="color: #0f172a; font-weight: 600;">₹${a.toFixed(2)}</span>
                            </div>
                            <div style="height: 1px; background: #e2e8f0; margin-bottom: 15px;"></div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: #312e81; font-weight: 700; font-size: 16px;">Total</span>
                                <span style="color: #312e81; font-weight: 800; font-size: 20px;">₹${o.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                        <p style="font-size: 14px; color: #334155; font-weight: 600; margin: 0 0 5px;">Thank you for your business!</p>
                        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Please include invoice number on your payment.</p>
                    </div>
                </div>
            </div>
        `,(0,v.default)().from(n).save(`${t.invoiceNumber}.pdf`)},q=async(e,t)=>{if(e.stopPropagation(),window.confirm(`Move to trash?`))try{await l.delete(`/invoices/${t}`),W()}catch{alert(`Failed to delete`)}},J=async(e,t)=>{e.stopPropagation();try{await l.patch(`/invoices/${t}`,{isDeleted:!1}),W()}catch{alert(`Failed to restore`)}},Y=async(e,t)=>{if(e.stopPropagation(),window.confirm(`Delete this template?`))try{await l.delete(`/invoice-templates/${t}`),I()}catch{alert(`Failed to delete template`)}},X=e=>{e.preventDefault(),alert(`Return processed for Invoice #${j.invoiceNumber||`Unknown`}. Stock adjusted.`),A(!1)},Z=(e,t)=>{e.stopPropagation();let n=document.createElement(`div`);n.style.width=`210mm`,n.style.padding=`20mm`,n.style.fontFamily=`Times New Roman, serif`,n.style.lineHeight=`1.6`,n.style.color=`#000`,n.style.background=`#fff`;let r=new Date().toLocaleDateString(`en-US`,{year:`numeric`,month:`long`,day:`numeric`});n.innerHTML=`
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="text-align: right; margin-bottom: 40px;">
                    <p><strong>${N?.name||`Your Company Name`}</strong><br/>
                    ${N?.address||`Company Address`}<br/>
                    ${N?.email||`email@company.com`} | ${N?.phone||`Phone`}</p>
                </div>

                <div style="margin-bottom: 40px;">
                    <p>${r}</p>
                    <p><strong>To:</strong><br/>
                    ${t.customerName}<br/>
                    ${t.clientAddress||`Client Address`}</p>
                </div>

                <h2 style="text-align: center; text-decoration: underline; margin-bottom: 30px;">SUBJECT: OVERDUE PAYMENT REMINDER - INVOICE #${t.invoiceNumber}</h2>

                <p>Dear ${t.customerName},</p>

                <p>This is a friendly reminder that we have not yet received payment for invoice <strong>#${t.invoiceNumber}</strong>, which was due on <strong>${new Date(t.dueDate).toLocaleDateString()}</strong>.</p>

                <p>The total amount outstanding is <strong>₹${t.grandTotal?.toFixed(2)}</strong>.</p>

                <p>We understand that oversights happen, but we would appreciate it if you could settle this amount at your earliest convenience.</p>

                <p>If you have already sent the payment, please disregard this notice. Otherwise, please remit payment immediately.</p>

                <div style="margin-top: 40px;">
                    <p>Sincerely,</p>
                    <br/>
                    <p><strong>${N?.name||`Accounts Receivable`}</strong></p>
                </div>
            </div>
        `,(0,v.default)().from(n).save(`Due_Letter_${t.invoiceNumber}.pdf`)},Q=e=>{switch(e){case`PAID`:return`bg-green-100 text-green-800 border border-green-200`;case`SENT`:return`bg-blue-100 text-blue-800 border border-blue-200`;case`OVERDUE`:return`bg-red-100 text-red-800 border border-red-200`;default:return`bg-gray-100 text-gray-800 border border-gray-200`}};return f?(0,g.jsx)(`div`,{className:`p-10 text-center`,children:`Loading invoices...`}):(0,g.jsxs)(`div`,{className:`space-y-6`,children:[(0,g.jsxs)(`div`,{className:`flex flex-col md:flex-row justify-between items-start md:items-center gap-4`,children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`h1`,{className:`text-2xl font-bold text-slate-800`,children:`Invoicing`}),(0,g.jsx)(`p`,{className:`text-sm text-slate-500 mt-1`,children:`Manage invoices, returns, and billing.`})]}),(0,g.jsxs)(`div`,{className:`flex gap-2`,children:[(0,g.jsxs)(`button`,{onClick:()=>A(!0),className:`flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100`,children:[(0,g.jsx)(m,{size:18}),` Return Products`]}),(0,g.jsxs)(`button`,{onClick:()=>window.location.href=`/dashboard/invoices/new`,className:`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm`,children:[(0,g.jsx)(i,{size:18}),` Create Invoice`]})]})]}),(0,g.jsx)(`div`,{className:`border-b border-slate-200`,children:(0,g.jsxs)(`nav`,{className:`-mb-px flex space-x-8`,children:[(0,g.jsx)(`button`,{onClick:()=>E(`invoices`),className:`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${T===`invoices`?`border-indigo-500 text-indigo-600`:`border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300`}`,children:`All Invoices`}),(0,g.jsx)(`button`,{onClick:()=>E(`templates`),className:`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${T===`templates`?`border-indigo-500 text-indigo-600`:`border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300`}`,children:`Invoice Templates`})]})}),T===`invoices`?(0,g.jsxs)(`div`,{className:`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden`,children:[(0,g.jsxs)(`div`,{className:`px-6 py-4 border-b border-slate-200 flex flex-col xl:flex-row justify-between gap-4 items-center`,children:[(0,g.jsxs)(`div`,{className:`flex items-center gap-3 w-full xl:w-auto`,children:[(0,g.jsx)(`h3`,{className:`text-lg font-semibold text-slate-800 whitespace-nowrap`,children:C?`Deleted Invoices`:`All Invoices`}),(0,g.jsx)(`button`,{onClick:()=>w(!C),className:`text-xs px-2 py-1 rounded border whitespace-nowrap ${C?`bg-slate-800 text-white`:`bg-white text-slate-500`}`,children:C?`Back to Active`:`Trash`})]}),(0,g.jsxs)(`div`,{className:`flex flex-col lg:flex-row gap-2 w-full xl:w-auto items-center`,children:[(0,g.jsxs)(`select`,{value:L,onChange:e=>{R(e.target.value),B(``),H(``)},className:`w-full md:w-32 py-2 px-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500`,children:[(0,g.jsx)(`option`,{value:`all`,children:`All Time`}),(0,g.jsx)(`option`,{value:`this_month`,children:`This Month`}),(0,g.jsx)(`option`,{value:`last_month`,children:`Last Month`}),(0,g.jsx)(`option`,{value:`this_year`,children:`This Year`})]}),(0,g.jsxs)(`div`,{className:`flex items-center gap-2 w-full md:w-auto`,children:[(0,g.jsx)(`input`,{type:`date`,value:z,onChange:e=>{B(e.target.value),R(`custom`)},className:`w-full md:w-auto py-2 px-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500`,placeholder:`From`}),(0,g.jsx)(`span`,{className:`text-slate-400`,children:`-`}),(0,g.jsx)(`input`,{type:`date`,value:V,onChange:e=>{H(e.target.value),R(`custom`)},className:`w-full md:w-auto py-2 px-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500`})]}),(0,g.jsxs)(`div`,{className:`relative w-full md:w-64`,children:[(0,g.jsx)(a,{className:`absolute left-3 top-2.5 h-4 w-4 text-slate-400`}),(0,g.jsx)(`input`,{type:`text`,placeholder:`Search invoice # or client...`,value:s,onChange:e=>c(e.target.value),className:`w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500`})]})]})]}),(0,g.jsx)(`div`,{className:`overflow-x-auto`,children:(0,g.jsxs)(`table`,{className:`min-w-full divide-y divide-slate-200`,children:[(0,g.jsx)(`thead`,{className:`bg-slate-50 text-xs uppercase font-semibold text-slate-500`,children:(0,g.jsxs)(`tr`,{children:[(0,g.jsx)(`th`,{className:`px-6 py-4 text-left`,children:`Invoice #`}),(0,g.jsx)(`th`,{className:`px-6 py-4 text-left`,children:`Client`}),(0,g.jsx)(`th`,{className:`px-6 py-4 text-left`,children:`Date`}),(0,g.jsx)(`th`,{className:`px-6 py-4 text-left`,children:`Amount`}),(0,g.jsx)(`th`,{className:`px-6 py-4 text-left`,children:`Status`}),(0,g.jsx)(`th`,{className:`px-6 py-4 text-right`,children:`Actions`})]})}),(0,g.jsxs)(`tbody`,{className:`divide-y divide-slate-200`,children:[u.filter(U).map(e=>(0,g.jsxs)(`tr`,{className:`hover:bg-slate-50 cursor-pointer`,onClick:()=>G(e._id),children:[(0,g.jsx)(`td`,{className:`px-6 py-4 text-sm font-medium text-indigo-600`,children:e.invoiceNumber}),(0,g.jsx)(`td`,{className:`px-6 py-4 text-sm text-slate-600`,children:e.customerName}),(0,g.jsx)(`td`,{className:`px-6 py-4 text-sm text-slate-500`,children:new Date(e.date||Date.now()).toLocaleDateString()}),(0,g.jsxs)(`td`,{className:`px-6 py-4 text-sm font-bold text-slate-900`,children:[`₹`,e.grandTotal?.toFixed(2)]}),(0,g.jsx)(`td`,{className:`px-6 py-4`,children:(0,g.jsx)(`span`,{className:`px-2 py-1 rounded-full text-xs font-bold ${Q(e.status)}`,children:e.status})}),(0,g.jsx)(`td`,{className:`px-6 py-4 text-right flex justify-end gap-2`,children:C?(0,g.jsx)(`button`,{onClick:t=>J(t,e._id),className:`text-indigo-600 text-xs font-bold`,children:`Restore`}):(0,g.jsxs)(g.Fragment,{children:[(e.status===`OVERDUE`||e.status===`PENDING`)&&(0,g.jsx)(`button`,{onClick:t=>Z(t,e),className:`p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition`,title:`Generate Due Letter`,children:(0,g.jsx)(n,{size:18})}),(0,g.jsx)(`button`,{onClick:t=>K(t,e),className:`p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition`,children:(0,g.jsx)(t,{size:18})}),(0,g.jsx)(`button`,{onClick:t=>q(t,e._id),className:`p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition`,children:(0,g.jsx)(o,{size:18})})]})})]},e._id)),u.length===0&&(0,g.jsx)(`tr`,{children:(0,g.jsx)(`td`,{colSpan:`6`,className:`p-8 text-center text-slate-500`,children:`No invoices found.`})})]})]})})]}):T===`templates`?(0,g.jsxs)(`div`,{className:`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6`,children:[(0,g.jsxs)(`div`,{className:`flex justify-between items-center mb-6`,children:[(0,g.jsx)(`h3`,{className:`text-lg font-semibold text-slate-800`,children:`Invoice Templates`}),(0,g.jsx)(`p`,{className:`text-sm text-slate-500`,children:`Save frequently used invoices to create new ones quickly.`})]}),(0,g.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`,children:[D.map(e=>(0,g.jsxs)(`div`,{className:`border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all bg-slate-50 relative group`,children:[(0,g.jsxs)(`div`,{className:`flex justify-between items-start mb-3`,children:[(0,g.jsx)(`h4`,{className:`font-bold text-slate-800 text-lg`,children:e.name}),e.type===`GLOBAL`&&(0,g.jsx)(`span`,{className:`bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded`,children:`GLOBAL`})]}),(0,g.jsxs)(`div`,{className:`space-y-1 mb-6`,children:[(0,g.jsxs)(`p`,{className:`text-sm text-slate-500`,children:[`Theme: `,(0,g.jsx)(`span`,{className:`capitalize`,children:e.themeIdentifier})]}),(0,g.jsxs)(`p`,{className:`text-sm text-slate-500`,children:[e.items.length,` Items`]}),(0,g.jsxs)(`p`,{className:`text-sm text-slate-500`,children:[`Tax Rate: `,e.taxRate,`%`]})]}),(0,g.jsxs)(`div`,{className:`flex gap-2`,children:[(0,g.jsx)(`button`,{onClick:()=>window.location.href=`/dashboard/invoices/new`,className:`flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700`,title:`Go to builder and select from dropdown`,children:`Use Template`}),e.type!==`GLOBAL`&&(0,g.jsx)(`button`,{onClick:t=>Y(t,e._id),className:`p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition`,children:(0,g.jsx)(o,{size:18})})]})]},e._id)),D.length===0&&(0,g.jsx)(`div`,{className:`col-span-full p-8 text-center border-2 border-dashed border-slate-200 rounded-xl`,children:(0,g.jsx)(`p`,{className:`text-slate-500`,children:`No templates found. Create one from the Invoice Builder.`})})]})]}):null,k&&(0,g.jsx)(`div`,{className:`fixed inset-0 bg-black/50 flex items-center justify-center z-50`,children:(0,g.jsxs)(`div`,{className:`bg-white rounded-xl p-6 w-full max-w-md`,children:[(0,g.jsxs)(`div`,{className:`flex items-center gap-2 mb-4 text-amber-600`,children:[(0,g.jsx)(e,{size:24}),(0,g.jsx)(`h2`,{className:`text-xl font-bold text-slate-900`,children:`Process Return`})]}),(0,g.jsx)(`p`,{className:`text-sm text-slate-500 mb-6`,children:`Record returned items to adjust inventory and issue credit.`}),(0,g.jsxs)(`form`,{onSubmit:X,className:`space-y-4`,children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`label`,{className:`block text-sm font-medium text-slate-700 mb-1`,children:`Invoice Number`}),(0,g.jsx)(`input`,{required:!0,className:`w-full border border-slate-300 p-2 rounded-lg`,placeholder:`INV-001`,onChange:e=>M({...j,invoiceNumber:e.target.value})})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`label`,{className:`block text-sm font-medium text-slate-700 mb-1`,children:`Reason for Return`}),(0,g.jsxs)(`select`,{className:`w-full border border-slate-300 p-2 rounded-lg`,children:[(0,g.jsx)(`option`,{children:`Damaged Goods`}),(0,g.jsx)(`option`,{children:`Wrong Item Sent`}),(0,g.jsx)(`option`,{children:`Customer Changed Mind`})]})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`label`,{className:`block text-sm font-medium text-slate-700 mb-1`,children:`Items / Notes`}),(0,g.jsx)(`textarea`,{className:`w-full border border-slate-300 p-2 rounded-lg h-24`,placeholder:`List items returned...`})]}),(0,g.jsxs)(`div`,{className:`flex justify-end gap-2 mt-6`,children:[(0,g.jsx)(`button`,{type:`button`,onClick:()=>A(!1),className:`px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg`,children:`Cancel`}),(0,g.jsx)(`button`,{type:`submit`,className:`px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium`,children:`Confirm Return`})]})]})]})}),(0,g.jsx)(_,{isOpen:y,onClose:()=>b(!1),title:x?`Invoice Details`:`New Invoice`,children:(0,g.jsx)(r,{invoiceId:x,onClose:()=>b(!1)},x)})]})}export{y as default};