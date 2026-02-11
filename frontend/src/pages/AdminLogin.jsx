import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Attempting Admin Login via AdminLogin.jsx...", formData.email);
      const userData = await login(formData.email, formData.password);

      // STRICT SEPARATION: Block Super Admin
      if (userData.isSuperAdmin || userData.role === 'SUPER_ADMIN') {
        // Generic error to prevent role enumeration
        throw new Error("Invalid email or password");
      }

      // Redirect handled by component logic or we can force it here just in case, 
      // but login() in AuthContext sets user state which might trigger redirects if we had protected routes wrappers.
      // For now, we manually redirect similar to Login.jsx
      navigate('/dashboard');

    } catch (err) {
      console.error("Admin Login Error:", err);
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-6">
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 md:p-10">
          <h1 className="text-2xl font-bold text-brand text-center">Company Admin Login</h1>
          <p className="text-slate-500 mt-2 text-center">Sign in to manage your company.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-slate-600">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-sm px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Login as Company Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
