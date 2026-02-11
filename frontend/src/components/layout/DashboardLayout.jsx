import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import {
    LayoutDashboard, Building2, Ticket, Flag, Cloud,
    BarChart3, Shield, Settings, LogOut, Users, Calendar, FileText, DollarSign, ChevronDown
} from 'lucide-react';

export default function DashboardLayout() {
    const { user, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [config, setConfig] = useState(null);
    const [configLoading, setConfigLoading] = useState(false);
    const location = useLocation();

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [authLoading, user, navigate]);

    // Fetch Effective Config (for Company Admins)
    useEffect(() => {
        if (authLoading || !user || user.isSuperAdmin) return;

        const fetchConfig = async () => {
            setConfigLoading(true);
            try {
                const res = await api.get('/company/config');
                setConfig(res.data);
            } catch (err) {
                console.error("Failed to load company config", err);
            } finally {
                setConfigLoading(false);
            }
        };
        fetchConfig();
    }, [user, authLoading]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Initializing...</div>;
    if (!user) return null; // Will redirect via useEffect

    // SUPER ADMIN SIDEBAR (Updated with Premium Icons)
    if (user.isSuperAdmin) {
        return (
            <div className="flex min-h-screen bg-slate-50 font-inter text-slate-900">
                <aside className="fixed inset-y-0 left-0 z-10 w-64 bg-white border-r border-slate-200">
                    <div className="flex h-16 items-center px-6 border-b border-slate-100">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow mr-3">
                            SA
                        </div>
                        <span className="text-lg font-bold text-slate-800 tracking-tight">SaaS Admin Pro</span>
                    </div>

                    <nav className="mt-6 px-3 space-y-1">
                        <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard Overview" href="/dashboard" active={location.pathname === '/dashboard'} />
                        <SidebarItem icon={<Building2 size={20} />} label="Companies" href="/dashboard/companies" active={location.pathname === '/dashboard/companies'} />
                        <SidebarItem icon={<Ticket size={20} />} label="Plans & Feature Flags" href="/dashboard/plans" active={location.pathname === '/dashboard/plans'} />

                        <div className="pt-4 pb-2">
                            <div className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">System</div>
                        </div>
                        <SidebarItem icon={<Cloud size={20} />} label="Cloud & Sync Control" href="/dashboard/sync" />
                        <SidebarItem icon={<BarChart3 size={20} />} label="Analytics (Year-wise)" href="/dashboard/analytics" />
                        <SidebarItem icon={<Shield size={20} />} label="Security & Logs" href="/dashboard/logs" />
                    </nav>

                    <div className="absolute bottom-0 w-full border-t border-slate-200 p-4">
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </aside>

                <div className="flex-1 ml-64 flex flex-col">
                    {/* Top Header */}
                    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-8">
                        <div className="flex items-center w-full max-w-md">
                            <input
                                type="text"
                                placeholder="Search for companies, features, or logs..."
                                className="w-full h-10 pl-4 pr-10 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                                <span className="sr-only">Notifications</span>
                                <div className="h-2 w-2 rounded-full bg-red-500 absolute top-3 right-3 border-2 border-white"></div>
                                🔔
                            </button>
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5">
                                <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                                    <img src={`https://ui-avatars.com/api/?name=${user.fullName}&background=random`} alt="Avatar" className="rounded-full" />
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="p-8">
                        <Outlet context={{ config }} />
                    </main>
                </div>
            </div>
        );
    }

    // COMPANY ADMIN LAYOUT (Clean style)
    return (
        <div className="flex min-h-screen bg-slate-50 font-inter text-slate-900">
            <aside className="fixed inset-y-0 left-0 z-10 w-64 bg-white border-r border-slate-200 overflow-y-auto">
                <div className="flex h-16 items-center px-6 border-b border-slate-100">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm shadow mr-3">
                        YO
                    </div>
                    <span className="text-lg font-bold text-slate-800 tracking-tight">{config?.company?.name || 'YVO Admin'}</span>
                </div>

                <nav className="mt-6 px-3 space-y-1">
                    <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" href="/dashboard" active={location.pathname === '/dashboard'} />

                    <div className="pt-4 pb-2">
                        <div className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Financials</div>
                    </div>

                    <SidebarItem
                        icon={<BarChart3 size={20} />}
                        label="Finance"
                        href="/dashboard/finance"
                        locked={!config?.modules?.finance}
                    />
                    <SidebarItem
                        icon={<FileText size={20} />}
                        label="Invoicing"
                        href="/dashboard/invoicing"
                        locked={!config?.modules?.invoicing}
                    />

                    <SidebarItem
                        icon={<Building2 size={20} />}
                        label="Inventory"
                        href="/dashboard/inventory"
                        locked={!config?.modules?.inventory}
                    />

                    <SidebarItem
                        icon={<Users size={20} />}
                        label="Employees"
                        locked={!config?.modules?.employees}
                        active={location.pathname.includes('/dashboard/employees') || location.pathname.includes('/dashboard/leaves') || location.pathname.includes('/dashboard/payroll')}
                        subItems={[
                            { label: 'All Employees', href: '/dashboard/employees', active: location.pathname === '/dashboard/employees' },
                            { label: 'Leaves', href: '/dashboard/leaves', active: location.pathname === '/dashboard/leaves' },
                            { label: 'Payroll', href: '/dashboard/payroll', active: location.pathname === '/dashboard/payroll' }
                        ]}
                    />

                    <SidebarItem
                        icon={<Calendar size={20} />}
                        label="Calendar"
                        href="/dashboard/calendar"
                        locked={!config?.modules?.calendar}
                    />

                    <SidebarItem
                        icon={<Building2 size={20} />}
                        label="Broadcasts"
                        href="/dashboard/broadcasts"
                        locked={!config?.modules?.broadcasts}
                    />

                    <div className="mt-6 border-t border-slate-100 pt-4">
                        <SidebarItem
                            icon={<BarChart3 size={20} />}
                            label="Analytics"
                            href="/dashboard/analytics"
                            locked={!config?.modules?.analytics}
                        />
                        <SidebarItem icon={<Settings size={20} />} label="Settings" href="/dashboard/settings" />
                    </div>
                </nav>

                <div className="mt-auto border-t border-slate-200 p-4">
                    <div className="mb-4 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs font-semibold text-slate-500 uppercase">Current Plan</div>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-bold text-indigo-600">{config?.company?.plan}</span>
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            <div className="flex-1 ml-64 flex flex-col">
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-8">
                    <h2 className="text-lg font-semibold text-slate-800">
                        {location.pathname === '/dashboard' ? 'Overview' : location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1)}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-right hidden md:block">
                            <div className="font-medium text-slate-900">{user.fullName}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                            <img src={`https://ui-avatars.com/api/?name=${user.fullName}`} alt="Profile" />
                        </div>
                    </div>
                </header>
                <main className="p-8">
                    {configLoading ? <div className="animate-pulse">Loading...</div> : <Outlet context={{ config }} />}
                </main>
            </div>
        </div>
    );
}

import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';

const SidebarItem = ({ icon, label, href, active, subItems, locked }) => {
    const [isOpen, setIsOpen] = useState(active);

    useEffect(() => {
        if (active) setIsOpen(true);
    }, [active]);

    const handleLockedClick = (e) => {
        if (locked) {
            e.preventDefault();
            toast.error("This feature is disabled by your company admin.");
        }
    };

    if (subItems) {
        return (
            <div className="space-y-1">
                <button
                    onClick={(e) => {
                        if (locked) {
                            handleLockedClick(e);
                            return;
                        }
                        setIsOpen(!isOpen);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
            ${active
                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                            : locked
                                ? 'text-slate-400 cursor-not-allowed hover:bg-slate-50'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <span className={active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}>
                            {icon}
                        </span>
                        {label}
                        {locked && <Lock size={14} className="ml-2 text-slate-400" />}
                    </div>
                    {!locked && <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />}
                </button>
                {isOpen && !locked && (
                    <div className="pl-10 space-y-1">
                        {subItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.href}
                                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 
                  ${item.active
                                        ? 'text-blue-600 bg-blue-50/50'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            to={href}
            onClick={handleLockedClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
      ${active
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : locked
                        ? 'text-slate-400 cursor-not-allowed hover:bg-slate-50'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
        >
            <span className={active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}>
                {icon}
            </span>
            {label}
            {locked && <Lock size={14} className="ml-auto text-slate-400" />}
        </Link>
    );
};
