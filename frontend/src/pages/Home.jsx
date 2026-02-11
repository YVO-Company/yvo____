import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Calendar, CheckCircle, CreditCard, FileText, Package, Users, Video } from 'lucide-react';

export default function Home() {
  const features = [
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
    <div className="pt-24">
      <section className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        <div className="space-y-6">
          <div className="text-sm font-semibold text-brand bg-blue-50 w-fit px-3 py-1 rounded-full">Home</div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight">
            Streamline Your <br /> Business with YVO
          </h1>
          <p className="text-slate-500">
            YVO empowers you to manage finances, inventory, and teams effortlessly. Boost efficiency and grow with our all-in-one
            SaaS solution.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/pricing"
              className="bg-slate-900 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-slate-800 transition"
            >
              View Demo
            </Link>
            <Link
              to="/signup"
              className="bg-brand text-white px-5 py-2 rounded-md text-sm font-semibold shadow hover:bg-blue-700 transition"
            >
              Create Account
            </Link>
            <Link
              to="/download"
              className="border border-slate-200 text-slate-600 px-5 py-2 rounded-md text-sm font-semibold hover:border-brand hover:text-brand transition"
            >
              Download App
            </Link>
          </div>
        </div>
        <div className="bg-slate-100 rounded-2xl p-6 shadow-sm">
          <img
            alt="Dashboard preview"
            className="w-full rounded-xl"
            src="https://placehold.co/640x420/png?text=Dashboard+Preview"
          />
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

      <section className="max-w-6xl mx-auto px-6 py-16">
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
