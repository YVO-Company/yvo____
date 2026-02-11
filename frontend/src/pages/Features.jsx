import React from 'react';
import { BarChart3, Calendar, CheckCircle, CreditCard, FileText, Package, Shield, Users } from 'lucide-react';

export default function Features() {
  const modules = [
    {
      title: 'Finance Management',
      description: 'Streamline your financial operations with robust tools for tracking income, expenses, and overall budget.',
      points: [
        'Automated transaction categorization',
        'Real-time financial reporting',
        'Comprehensive budget planning and control',
        'Multi-currency support for global operations',
      ],
      icon: <CreditCard className="text-brand" />,
    },
    {
      title: 'Invoice Generator',
      description: 'Create professional invoices quickly, send them to clients, and track payment status effortlessly.',
      points: [
        'Customizable invoice templates',
        'Automated recurring invoices',
        'Secure payment gateway integration',
        'Detailed client payment tracking and reminders',
      ],
      icon: <FileText className="text-brand" />,
    },
    {
      title: 'Inventory Management',
      description: 'Optimize your stock levels, track product movement, and manage supplies across multiple locations.',
      points: [
        'Real-time stock tracking and alerts',
        'Automated reorder notifications',
        'Efficient supplier and vendor management',
        'Integrated barcode scanning for quick updates',
      ],
      icon: <Package className="text-brand" />,
    },
    {
      title: 'Employee Management',
      description: 'Manage your team efficiently with tools for onboarding, performance tracking, and payroll processing.',
      points: [
        'Centralized employee database',
        'Streamlined leave management and tracking',
        'Configurable performance review cycles',
        'Integrated payroll system for accuracy',
      ],
      icon: <Users className="text-brand" />,
    },
    {
      title: 'Reminders & Calendar',
      description: 'Keep track of important tasks, appointments, and deadlines with an integrated calendar system.',
      points: [
        'Synchronized team calendars',
        'Customizable task reminders',
        'Intuitive event scheduling and management',
        'Seamless integration with external calendars',
      ],
      icon: <Calendar className="text-brand" />,
    },
    {
      title: 'Analytics & Reporting',
      description: 'Gain deep insights into your business performance with comprehensive data visualization tools.',
      points: [
        'Interactive dashboards for key metrics',
        'Customizable report generation',
        'Key performance indicator (KPI) tracking',
        'Predictive analytics tools for future planning',
      ],
      icon: <BarChart3 className="text-brand" />,
    },
    {
      title: 'Role-Based Access',
      description: 'Ensure data security and control access to sensitive information with robust role-based permissions.',
      points: [
        'Granular permission control',
        'Customizable user roles',
        'Audit logs for activity tracking',
        'Enhanced data privacy and compliance',
      ],
      icon: <Shield className="text-brand" />,
    },
  ];

  return (
    <div className="pt-24">
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-black">Features That Empower Your Business</h1>
        <p className="text-slate-500 mt-4 max-w-3xl mx-auto">
          Discover how YVO's comprehensive modules streamline your operations, enhance productivity, and provide the insights you
          need to grow.
        </p>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div key={module.title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition">
            <div className="bg-blue-50 w-10 h-10 flex items-center justify-center rounded-xl">{module.icon}</div>
            <h3 className="font-semibold text-lg mt-4">{module.title}</h3>
            <p className="text-sm text-slate-500 mt-2">{module.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              {module.points.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-brand mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
