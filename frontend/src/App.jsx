import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Help from './pages/Help';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import SuperAdminLogin from './pages/SuperAdminLogin';
import Signup from './pages/Signup';
import Download from './pages/Download';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Companies from './pages/super-admin/Companies';
import CreateCompany from './pages/super-admin/CreateCompany';
import Plans from './pages/super-admin/Plans';
import SyncControl from './pages/super-admin/SyncControl';
import Finance from './pages/modules/Finance';
import Invoicing from './pages/modules/Invoicing';
import Inventory from './pages/modules/Inventory';
import Employees from './pages/modules/Employees';
import CalendarModule from './pages/modules/CalendarModule';
import Settings from './pages/modules/Settings';
import Analytics from './pages/modules/Analytics';
import InvoiceBuilder from './pages/modules/InvoiceBuilder';
import Payroll from './pages/modules/Payroll';
import Leaves from './pages/modules/Leaves';
import Broadcasts from './pages/modules/Broadcasts'; // Admin Broadcasts

// Employee Pages
import EmployeeLayout from './pages/employee/EmployeeLayout';
import EmployeeHome from './pages/employee/EmployeeHome';
import EmployeeSalary from './pages/employee/EmployeeSalary';
import EmployeeLeave from './pages/employee/EmployeeLeave';
import EmployeeCalendar from './pages/employee/EmployeeCalendar';
import EmployeeBroadcasts from './pages/employee/EmployeeBroadcasts';

import { Outlet } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes with Header/Footer */}
          <Route element={<><Header /><main className="flex-grow"><Outlet /></main><Footer /></>}>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/help" element={<Help />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/super-admin-login" element={<SuperAdminLogin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/download" element={<Download />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <ErrorBoundary>
              <DashboardLayout />
            </ErrorBoundary>
          }>
            <Route index element={<DashboardHome />} />
            {/* Dashboard Sub-routes */}
            <Route path="finance" element={<Finance />} />
            <Route path="invoicing" element={<Invoicing />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="employees" element={<Employees />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="calendar" element={<CalendarModule />} />
            <Route path="settings" element={<Settings />} />

            {/* Super Admin Routes */}
            <Route path="companies" element={<Companies />} />
            <Route path="companies/new" element={<React.Suspense fallback={<div>Loading...</div>}><CreateCompany /></React.Suspense>} />
            <Route path="plans" element={<Plans />} />
            <Route path="sync" element={<SyncControl />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="invoices/new" element={<InvoiceBuilder />} />
            <Route path="logs" element={<div className="p-10 text-center text-slate-500">Security Logs (Coming Soon)</div>} />

            {/* Admin Broadcasts */}
            <Route path="broadcasts" element={<Broadcasts />} />
          </Route>

          {/* Employee Routes */}
          <Route path="/employee-dashboard" element={<EmployeeLayout />}>
            <Route index element={<EmployeeHome />} />
            <Route path="salary" element={<EmployeeSalary />} />
            <Route path="leaves" element={<EmployeeLeave />} />
            <Route path="calendar" element={<EmployeeCalendar />} />
            <Route path="broadcasts" element={<EmployeeBroadcasts />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}
