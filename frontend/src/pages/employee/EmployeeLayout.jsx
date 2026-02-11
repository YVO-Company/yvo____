import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, DollarSign, Calendar, MessageSquare, LogOut, FileText, Menu, X
} from 'lucide-react';

export default function EmployeeLayout() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'employee')) {
            navigate('/login');
        }
    }, [loading, user, navigate]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-slate-50 font-inter text-slate-900">
            {/* MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
                    <div className="flex items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm shadow mr-3">
                            EMP
                        </div>
                        <span className="text-lg font-bold text-slate-800 tracking-tight">Portal</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <nav className="mt-6 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
                    <SidebarItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        href="/employee-dashboard"
                        active={location.pathname === '/employee-dashboard'}
                    />
                    <SidebarItem
                        icon={<DollarSign size={20} />}
                        label="My Salary"
                        href="/employee-dashboard/salary"
                        active={location.pathname === '/employee-dashboard/salary'}
                    />
                    <SidebarItem
                        icon={<FileText size={20} />}
                        label="Leaves"
                        href="/employee-dashboard/leaves"
                        active={location.pathname === '/employee-dashboard/leaves'}
                    />
                    <SidebarItem
                        icon={<Calendar size={20} />}
                        label="Calendar"
                        href="/employee-dashboard/calendar"
                        active={location.pathname === '/employee-dashboard/calendar'}
                    />
                    <SidebarItem
                        icon={<MessageSquare size={20} />}
                        label="Broadcasts"
                        href="/employee-dashboard/broadcasts"
                        active={location.pathname === '/employee-dashboard/broadcasts'}
                    />
                </nav>

                <div className="absolute bottom-0 w-full border-t border-slate-200 p-4 bg-white">
                    <div className="mb-4 flex items-center gap-3 px-2">
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`}
                            alt="Avatar"
                            className="h-9 w-9 rounded-full border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-slate-500 truncate">{user.position}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 md:ml-64 flex flex-col min-w-0">
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-lg font-semibold text-slate-800 truncate">
                            {location.pathname === '/employee-dashboard' ? 'Overview' : location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1)}
                        </h2>
                    </div>
                    <div className="text-sm text-slate-500 hidden sm:block">
                        {user.companyId?.name || 'Company Name'}
                    </div>
                </header>

                <main className="p-4 md:p-8 flex-1 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

const SidebarItem = ({ icon, label, href, active }) => (
    <Link
        to={href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
      ${active
                ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
    >
        <span className={active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}>
            {icon}
        </span>
        {label}
    </Link>
);
