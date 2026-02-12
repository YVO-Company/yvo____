import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Calendar, CheckCircle, CreditCard, FileText, Package, Users, Video, Database } from 'lucide-react';

export default function Home() {
  const features = [
    {
      title: 'Digital Finance Ledger',
      description: 'Manage your accounts with an Excel-style digital book designed to store and track all your financial data.',
      icon: <Database className="text-brand" />,
    },
    {
      title: 'Finance Management',
      description: 'Track income, expenses, and generate financial reports effortlessly.',
      icon: <CreditCard className="text-brand" />,
    },
    {
      title: 'Invoice Automation',
      description: 'Create professional invoices, send reminders, and manage payments with ease.',
      icon: <FileText className="text-brand" />,
    },
    {
      title: 'Inventory Control',
      description: 'Monitor stock levels, manage suppliers, and optimize your inventory in real-time.',
      icon: <Package className="text-brand" />,
    },
    {
      title: 'Employee Management',
      description: 'Handle HR tasks, payroll, and team performance with integrated tools.',
      icon: <Users className="text-brand" />,
    },
    {
      title: 'Reminders & Calendar',
      description: 'Stay organized with smart reminders and a centralized calendar for all tasks.',
      icon: <Calendar className="text-brand" />,
    },
    {
      title: 'Advanced Analytics',
      description: 'Gain deep insights into your business performance with customizable dashboards.',
      icon: <BarChart3 className="text-brand" />,
    },
  ];

  const plans = [
    {
      name: 'Starter',
      price: '₹29',
      description: 'per month, billed annually',
      features: ['Basic Finance Tracking', 'Invoice Generation (50/month)', 'Single User Account', 'Standard Support'],
      cta: 'Start Free Trial',
    },
    {
      name: 'Growth',
      price: '₹79',
      description: 'per month, billed annually',
      features: ['Advanced Finance Reporting', 'Unlimited Invoices', 'Up to 5 User Accounts', 'Priority Support', 'Basic Inventory'],
      cta: 'Get Started',
      highlighted: true,
    },
    {
      name: 'Pro',
      price: '₹199',
      description: 'per month, billed annually',
      features: [
        'Comprehensive Financial Suite',
        'Unlimited Invoices & Clients',
        'Unlimited User Accounts',
        'Dedicated Account Manager',
        'Advanced Inventory & HR',
        'Customizable Analytics',
      ],
      cta: 'Explore Pro',
    },
  ];

  return (
    <div className="pt-24 overflow-x-hidden">
      {/* Redesigned Hero Section per Reference Image */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center relative">
        <div className="relative z-10 space-y-10">
          <h1 className="text-5xl md:text-8xl font-normal tracking-tight text-slate-900 font-hand leading-tight drop-shadow-sm">
            All your business on <span className="highlight-brush inline-block px-4">one platform.</span>
          </h1>

          <div className="relative inline-block float-slow">
            <h2 className="text-3xl md:text-5xl font-hand text-slate-700 italic opacity-90">
              Simple, efficient, yet <span className="underline-brush">affordable!</span>
            </h2>
          </div>

          <div className="flex justify-center pt-6">
            <Link
              to="/signup"
              className="btn-brush text-2xl"
            >
              Start now
            </Link>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Main Feature Preview */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-slate-900 rounded-[3rem] p-4 md:p-8 shadow-2xl shadow-slate-900/30 overflow-hidden group">
          <div className="bg-white rounded-[2rem] overflow-hidden aspect-video relative">
            <img
              alt="Dashboard preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-[1fr_1.2fr] gap-10 items-center">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Get the YVO Desktop App</h2>
          <p className="text-slate-500 text-sm">
            Enhance your productivity with the YVO desktop application. Enjoy seamless offline access, improved performance, and
            native system integration for an unparalleled experience.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/download" className="bg-brand text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition">
              Download for Windows
            </Link>
            <Link to="/download" className="bg-slate-100 text-slate-600 px-4 py-2 rounded-md text-sm font-semibold hover:bg-slate-200 transition">
              Download for macOS
            </Link>
            <Link to="/download" className="border border-blue-200 text-brand px-4 py-2 rounded-md text-sm font-semibold hover:border-brand transition">
              Download for Linux
            </Link>
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-6">
          <img
            alt="Desktop preview"
            className="w-full rounded-xl"
            src="https://placehold.co/640x360/png?text=Desktop+App"
          />
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-center text-3xl font-black mb-3">Powerful Features Designed for Your Success</h2>
        <p className="text-center text-slate-500 max-w-2xl mx-auto">
          Discover how YVO's comprehensive modules can simplify your daily operations and boost productivity.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="bg-blue-50 w-10 h-10 flex items-center justify-center rounded-xl mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-3xl font-black mb-2">Flexible Plans for Every Business Size</h2>
          <p className="text-center text-slate-500 mb-10">Choose the perfect YVO plan that scales with your needs, from startups to large enterprises.</p>
          <div className="grid lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-4 ${plan.highlighted ? 'border-brand shadow-md' : 'border-slate-100'
                  }`}
              >
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <div className="text-2xl font-black text-brand">{plan.price}</div>
                  <p className="text-xs text-slate-400">{plan.description}</p>
                </div>
                <ul className="space-y-2 text-sm text-slate-500">
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-brand" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/pricing?plan=${plan.name.toLowerCase()}`}
                  className={`mt-auto w-full px-4 py-2 rounded-md text-sm font-semibold transition text-center ${plan.highlighted
                    ? 'bg-brand text-white hover:bg-blue-700'
                    : 'border border-slate-200 text-slate-600 hover:border-brand hover:text-brand'
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-center text-3xl font-black mb-3">See YVO in Action</h2>
        <p className="text-center text-slate-500 mb-10">Watch our guided tour to understand how YVO can revolutionize your business operations.</p>
        <div className="bg-slate-100 rounded-3xl p-6 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-3xl h-56 flex items-center justify-center">
            <Video className="text-slate-400" size={48} />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-brand text-white rounded-2xl py-10 px-6 text-center shadow-md">
          <h2 className="text-2xl font-bold">Ready to Transform Your Business Operations?</h2>
          <Link to="/signup" className="mt-4 inline-block bg-white text-brand font-semibold px-5 py-2 rounded-md hover:bg-blue-50 transition">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
