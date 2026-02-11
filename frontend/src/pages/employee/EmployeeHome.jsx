import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { DollarSign, Clock, Calendar, MessageSquare } from 'lucide-react';

const StatCard = ({ icon, label, value, subtext }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400">{subtext}</p>
        </div>
    </div>
); import { X } from 'lucide-react';

export default function EmployeeHome() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        pendingLeaves: 0,
        upcomingEvents: 0,
        unreadBroadcasts: 0,
        lastSalary: null
    });
    const [loading, setLoading] = useState(true);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveForm, setLeaveForm] = useState({
        type: 'Sick Leave',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const fetchStats = async () => {
        try {
            const leavesRes = await api.get('/employee/dashboard/leaves');
            const calendarRes = await api.get('/employee/dashboard/calendar');
            const broadcastsRes = await api.get('/employee/dashboard/broadcasts');
            const salaryRes = await api.get('/employee/dashboard/salary');

            setStats({
                pendingLeaves: leavesRes.data.filter(l => l.status === 'Pending').length,
                upcomingEvents: calendarRes.data.length,
                unreadBroadcasts: broadcastsRes.data.length,
                lastSalary: salaryRes.data.length > 0 ? salaryRes.data[0] : null
            });
        } catch (error) {
            console.error("Error loading stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/employee/dashboard/leaves', leaveForm);
            alert('Leave application submitted successfully!');
            setShowLeaveModal(false);
            setLeaveForm({ type: 'Sick Leave', startDate: '', endDate: '', reason: '' });
            fetchStats(); // Refresh stats
        } catch (err) {
            console.error(err);
            alert('Failed to apply for leave');
        }
    };

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Welcome Back!</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<DollarSign className="text-emerald-600" />}
                    label="Last Salary"
                    value={stats.lastSalary ? `₹${stats.lastSalary.amount}` : 'N/A'}
                    subtext={stats.lastSalary ? stats.lastSalary.payPeriod : '-'}
                />
                <StatCard
                    icon={<Clock className="text-orange-600" />}
                    label="Pending Leaves"
                    value={stats.pendingLeaves}
                    subtext="Awaiting approval"
                />
                <StatCard
                    icon={<Calendar className="text-blue-600" />}
                    label="Upcoming Events"
                    value={stats.upcomingEvents}
                    subtext="Scheduled"
                />
                <StatCard
                    icon={<MessageSquare className="text-purple-600" />}
                    label="Broadcasts"
                    value={stats.unreadBroadcasts}
                    subtext="Recent messages"
                />
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowLeaveModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Apply for Leave
                    </button>
                    <button
                        onClick={() => navigate('/employee-dashboard/calendar')}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                    >
                        View Calendar
                    </button>
                </div>
            </div>

            {/* LEAVE APPLICATION MODAL */}
            {showLeaveModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">Apply for Leave</h2>
                            <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Leave Type</label>
                                <select
                                    className="w-full border border-slate-200 p-2 rounded-lg bg-white"
                                    value={leaveForm.type}
                                    onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })}
                                >
                                    <option>Sick Leave</option>
                                    <option>Casual Leave</option>
                                    <option>Paid Leave</option>
                                    <option>Unpaid Leave</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-slate-200 p-2 rounded-lg"
                                        value={leaveForm.startDate}
                                        onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-slate-200 p-2 rounded-lg"
                                        value={leaveForm.endDate}
                                        onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Reason</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full border border-slate-200 p-2 rounded-lg"
                                    value={leaveForm.reason}
                                    onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                    placeholder="Brief reason for leave..."
                                />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
