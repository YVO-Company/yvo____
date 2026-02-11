import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MainContent = () => {
  // Plans data
  const plans = useMemo(
    () => [
      { id: 'starter', name: 'Starter', price: '₹29' },
      { id: 'growth', name: 'Growth', price: '₹79' },
      { id: 'pro', name: 'Pro', price: '₹199' },
    ],
    []
  );

  // Trust cards data
  const trustCards = useMemo(
    () => [
      {
        title: 'Secure & Reliable',
        description: 'Your data is protected with strong security best practices.',
        icon: <ShieldIcon />,
      },
      {
        title: '24/7 Support',
        description: 'We are here to help you anytime, anywhere.',
        icon: <SupportIcon />,
      },
      {
        title: 'Trusted by Thousands',
        description: 'Businesses worldwide use YVO daily.',
        icon: <UsersIcon />,
      },
    ],
    []
  );

  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });

  // Parse URL query params
  const queryParams = new URLSearchParams(window.location.search);
  const initialPlan = queryParams.get('plan') ? queryParams.get('plan').toLowerCase() : 'starter';

  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan);
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Helper to safely find plan, defaulting to first if not found
  const selectedPlan = useMemo(() => plans.find((p) => p.id === selectedPlanId) || plans[0], [plans, selectedPlanId]);

  // Ref for the form to scroll to
  const formRef = React.useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlanId(planId);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlanRequest = async (e) => {
    e.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    const priceString = selectedPlan?.price || '0';
    const amount = parseInt(priceString.replace(/[^\d]/g, ''), 10);

    if (!amount) {
      setStatus({ type: 'error', message: 'Invalid plan amount.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        setStatus({ type: 'error', message: 'Razorpay SDK failed to load.' });
        setIsSubmitting(false);
        return;
      }

      // 1. Create Order
      const { data: order } = await api.post('/payment/create-order', {
        amount: amount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      });

      // 2. Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Enter the Key ID generated from the Dashboard
        amount: order.amount,
        currency: order.currency,
        name: 'YVO SaaS',
        description: `Subscription for ${selectedPlan?.name} Plan`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment & Create Account
            const verifyRes = await api.post('/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
              planId: selectedPlanId
            });

            if (verifyRes.data.success) {
              setStatus({
                type: 'success',
                message: `Payment successful! Plan "${selectedPlan?.name}" has been activated.`,
              });

              // Redirect logic
              if (verifyRes.data.token) {
                localStorage.setItem('token', verifyRes.data.token);
                localStorage.setItem('userProfileName', verifyRes.data.user.fullName);
                localStorage.setItem('userRole', verifyRes.data.user.role || 'owner');
                window.dispatchEvent(new Event('storage'));
                setTimeout(() => navigate('/dashboard/companies'), 1500);
              }
            } else {
              setStatus({ type: 'error', message: verifyRes.data.message || 'Verification failed.' });
            }

            setFormData({ name: '', email: '', phone: '' });
            setSelectedPlanId(plans[0]?.id || 'starter');
          } catch (verifyError) {
            console.error(verifyError);
            setStatus({ type: 'error', message: 'Payment verification failed.' });
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#3399cc'
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        setStatus({ type: 'error', message: `Payment failed: ${response.error.description}` });
      });
      rzp1.open();

    } catch (err) {
      console.error(err);
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans text-slate-900 bg-white">
      {/* PRICING SECTION */}
      <section className="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Flexible Plans for Every Business</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Choose the perfect plan that scales with your needs, from startups to enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
            <PricingCard
              title="Starter"
              price="29"
              description="per month, billed annually"
              features={['Basic Finance Tracking', 'Invoice Generation (50/month)', 'Single User Account', 'Standard Support']}
              buttonText="Buy Now"
              isPopular={false}
              onSelect={() => handlePlanSelect('starter')}
            />

            <PricingCard
              title="Growth"
              price="79"
              description="per month, billed annually"
              features={[
                'Advanced Finance Reporting',
                'Unlimited Invoices',
                'Up to 5 User Accounts',
                'Priority Support',
                'Basic Inventory',
              ]}
              buttonText="Buy Now"
              isPopular={true}
              onSelect={() => handlePlanSelect('growth')}
            />

            <PricingCard
              title="Pro"
              price="199"
              description="per month, billed annually"
              features={[
                'Comprehensive Financial Suite',
                'Unlimited Invoices & Clients',
                'Unlimited User Accounts',
                'Dedicated Account Manager',
                'Advanced Inventory & HR',
                'Customizable Analytics',
              ]}
              buttonText="Buy Now"
              isPopular={false}
              onSelect={() => handlePlanSelect('pro')}
            />
          </div>
        </div>
      </section>

      {/* PLAN REQUEST FORM */}
      <section className="bg-white py-16" ref={formRef}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 md:p-10">
            <h2 className="text-2xl font-bold">Registration & Payment</h2>
            <p className="text-slate-500 mt-2">Complete your purchase for the <span className='font-bold text-brand'>{selectedPlan.name}</span> plan.</p>

            <form className="mt-6 grid md:grid-cols-2 gap-4" onSubmit={handlePlanRequest}>
              <div>
                <label className="text-sm text-slate-600">Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Password</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Create a strong password"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Phone (optional)</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Selected Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(event) => setSelectedPlanId(event.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({plan.price})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPlan && (
                <div className="md:col-span-2 text-sm text-slate-500">
                  Selected plan: <span className="font-semibold text-slate-700">{selectedPlan.name}</span>
                </div>
              )}

              {status && (
                <div
                  className={`md:col-span-2 text-sm px-3 py-2 rounded-lg ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}
                >
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="md:col-span-2 bg-brand text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-70"
              >
                {isSubmitting ? 'Processing...' : `Pay ₹${parseInt(selectedPlan.price.replace(/[^\d]/g, ''), 10)} & Register`}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* TRUST CARDS */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold">Why Businesses Trust YVO</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {trustCards.map((card) => (
              <div key={card.title} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="bg-blue-50 w-10 h-10 flex items-center justify-center rounded-xl mx-auto">{card.icon}</div>
                <h3 className="font-semibold mt-4">{card.title}</h3>
                <p className="text-sm text-slate-500 mt-2">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-gray-100 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Why Businesses Trust YVO</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldIcon />}
              title="Secure & Reliable"
              description="Your data is protected with industry-leading encryption and compliance standards."
            />

            <FeatureCard icon={<SupportIcon />} title="24/7 Expert Support" description="Our dedicated support team is always here." />

            <FeatureCard icon={<UsersIcon />} title="Trusted by Thousands" description="Join a community of businesses worldwide." />
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            <FAQItem question="What is the difference between monthly and annual billing?" />
            <FAQItem question="Can I change my plan later?" />
            <FAQItem question="Are there any hidden fees?" />
            <FAQItem question="Do you offer a free trial?" />
            <FAQItem question="What payment methods do you accept?" />
            <FAQItem question="What if I need custom features not listed in the Enterprise plan?" />
          </div>
        </div>
      </section>
    </div>
  );
};

// -------------------- SUB COMPONENTS --------------------

const PricingCard = ({ title, price, description, features, buttonText, isPopular, onSelect }) => {
  return (
    <div
      className={`bg-white rounded-xl p-8 transition-all duration-300 ${isPopular ? 'border-2 border-blue-500 shadow-xl scale-105 z-10' : 'border border-gray-200 shadow-sm hover:shadow-md'
        }`}
    >
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <div className="flex items-baseline mb-1">
        <span className="text-4xl font-bold text-blue-600">₹{price}</span>
      </div>
      <p className="text-sm text-gray-500 mb-6">{description}</p>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <CheckIcon />
            </div>
            <span className="ml-3 text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSelect}
        className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-colors ${isPopular ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
      >
        {buttonText}
      </button>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm flex flex-col items-center text-center border border-gray-100">
      <div className="text-blue-500 mb-4 bg-blue-50 p-4 rounded-full">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{description}</p>
    </div>
  );
};

const FAQItem = ({ question }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors text-left"
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="text-slate-800 font-medium">{question}</span>
        <span className={`transform transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>

      <div
        className={`bg-gray-50 px-5 text-sm text-gray-600 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'
          }`}
      >
        <p>This is a placeholder answer. Replace with your real FAQ content.</p>
      </div>
    </div>
  );
};

// -------------------- ICONS --------------------

const CheckIcon = () => (
  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const SupportIcon = () => (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

export default MainContent;
