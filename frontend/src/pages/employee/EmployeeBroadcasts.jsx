import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { MessageSquare, User } from 'lucide-react';

export default function EmployeeBroadcasts() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await api.get('/employee/dashboard/broadcasts');
                setMessages(res.data);
            } catch (error) {
                console.error("Error fetching broadcasts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Broadcast Messages</h1>

            <div className="space-y-4">
                {messages.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl">
                        No messages received.
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg._id} className="flex gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <MessageSquare size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-slate-900">
                                        {msg.senderId?.fullName || "Admin"}
                                    </h3>
                                    <span className="text-xs text-slate-400">
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                                    {msg.targetAll ? "To: All Employees" : "To: Your Group"}
                                </div>
                                <div className="prose prose-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    {msg.content}
                                </div>
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mt-2 text-xs text-blue-600">
                                        {msg.attachments.length} Attachment(s)
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
