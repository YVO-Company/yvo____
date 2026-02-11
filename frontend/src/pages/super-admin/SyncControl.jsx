import React from 'react';
import { Cloud, RotateCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function SyncControl() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Cloud & Sync Control</h1>
                <p className="text-sm text-slate-500 mt-1">Monitor synchronization status and cloud storage limits.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT COL: CONTROLS */}
                <div className="space-y-8">
                    {/* SETTINGS CARD */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-semibold text-slate-800 mb-6">Cloud Storage Settings</h3>

                        <div className="flex items-center justify-between py-4 border-b border-slate-100">
                            <div>
                                <div className="font-medium text-slate-900">Mandatory Cloud Storage</div>
                                <div className="text-xs text-slate-500">Enforce cloud backups for all tenants</div>
                            </div>
                            <div className="relative inline-block w-12 mr-2 align-middle select-none">
                                <span className="absolute block w-6 h-6 rounded-full bg-white border-4 border-blue-600 right-0 cursor-pointer"></span>
                                <span className="block overflow-hidden h-6 rounded-full bg-blue-600 cursor-pointer"></span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-4">
                            <div>
                                <div className="font-medium text-slate-900">Auto Yearly Sync</div>
                                <div className="text-xs text-slate-500">Archive data annually automatically</div>
                            </div>
                            <div className="relative inline-block w-12 mr-2 align-middle select-none">
                                <span className="absolute block w-6 h-6 rounded-full bg-white border-4 border-slate-300 left-0 cursor-pointer"></span>
                                <span className="block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"></span>
                            </div>
                        </div>
                    </div>

                    {/* USAGE CARD */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Current Data Usage</h3>
                        <div className="w-full bg-slate-100 rounded-full h-4 mb-2">
                            <div className="bg-blue-600 h-4 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-slate-600">
                            <span>7.2 TB / 10.0 TB</span>
                            <span>72%</span>
                        </div>
                    </div>

                    {/* MANUAL SYNC */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-semibold text-slate-800 mb-2">Manual Synchronization</h3>
                        <p className="text-sm text-slate-500 mb-4">Trigger an immediate data synchronization process across all active services.</p>
                        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors">
                            Trigger Manual Sync
                        </button>
                    </div>
                </div>

                {/* RIGHT COL: ACTIVITY & ALERTS */}
                <div className="space-y-6">
                    {/* ALERT BOX */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                        <AlertTriangle className="text-red-600 shrink-0" />
                        <div>
                            <h4 className="font-semibold text-red-800 text-sm">Sync Failure Detected</h4>
                            <p className="text-xs text-red-700 mt-1">One or more cloud synchronization processes have failed recently. Please check the activity logs for more details.</p>
                        </div>
                    </div>

                    {/* LOGS */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-semibold text-slate-800 mb-6">Recent Sync Activity</h3>
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            {[
                                { status: 'success', time: '2024-07-26 14:30:00', text: 'Monthly data backup completed.' },
                                { status: 'fail', time: '2024-07-25 09:15:00', text: 'Cloud storage connection error for SaaS Admin Pro.' },
                                { status: 'success', time: '2024-07-24 23:00:00', text: 'Daily database synchronization finished.' },
                                { status: 'success', time: '2024-07-23 07:00:00', text: 'Incremental file sync uploaded successfully.' },
                                { status: 'fail', time: '2024-07-22 18:45:00', text: 'Large file upload timeout during manual sync.' }
                            ].map((log, idx) => (
                                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                        {log.status === 'success' ? <CheckCircle size={14} className="text-green-600" /> : <AlertTriangle size={14} className="text-red-500" />}
                                    </div>
                                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-0 md:px-0">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="text-xs font-mono text-slate-500">{log.time}</div>
                                            <div className="text-sm text-slate-800">{log.text}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
