import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Help', to: '/help' },
];

export default function Header() {
  const [profile, setProfile] = useState({ name: '', role: '' });

  useEffect(() => {
    const loadProfile = () => {
      const name = localStorage.getItem('userProfileName') || '';
      const role = localStorage.getItem('userRole') || '';
      const hasToken = Boolean(localStorage.getItem('userToken'));
      setProfile(hasToken ? { name: name || 'Account', role } : { name: '', role: '' });
    };

    loadProfile();
    window.addEventListener('storage', loadProfile);
    return () => window.removeEventListener('storage', loadProfile);
  }, []);

  const initials = useMemo(() => {
    if (!profile.name) return 'U';
    return profile.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((item) => item[0]?.toUpperCase())
      .join('');
  }, [profile.name]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userProfileName');
    localStorage.removeItem('userRole');
    setProfile({ name: '', role: '' });
  };

  const styles = {
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 20px",
      background: "#0f172a",
      color: "#fff",
    },
    loader: {
      width: "30px",
      height: "30px",
      borderRadius: "10%",
    },
  };

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Loading..."
            style={styles.loader}
          />
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-brand transition">
              {link.label}
            </Link>
          ))}
        </div>

        {profile.name ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-slate-200 rounded-full px-3 py-1.5">
              <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
              <div className="text-sm font-semibold text-slate-700">{profile.name}</div>
              {profile.role && <span className="text-xs text-slate-400 uppercase">{profile.role}</span>}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-brand transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/admin-login"
              className="border border-brand text-brand px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-50 transition"
            >
              Company Login
            </Link>

            <Link
              to="/login"
              className="bg-brand text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:bg-blue-700 transition"
            >
              Employee Login
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
