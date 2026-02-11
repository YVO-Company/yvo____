import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const businessTypes = [
  "Technology",
  "Retail",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
];

const inputClassName =
  "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function Signup() {
  const navigate = useNavigate();
  const { registerCompany } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessType, setBusinessType] = useState(businessTypes[0]);

  // TEST ONLY (later remove and auto-assign after payment)
  const [companyId, setCompanyId] = useState("CMP-0001");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!fullName.trim()) return setMsg("Please enter full name.");
    if (!normalizedEmail) return setMsg("Please enter email.");
    if (!password) return setMsg("Please enter password.");
    if (password.length < 6) return setMsg("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setMsg("Passwords do not match.");

    setLoading(true);
    try {
      const payload = {
        companyName: fullName + "'s Company",
        ownerName: fullName.trim(),
        email: normalizedEmail,
        password,
        // businessType
      };

      await registerCompany(payload);

      setMsg("Account created ✅ Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard", { replace: true }), 700);
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-semibold text-white shadow">
            Yo
          </div>
          <span className="text-lg font-semibold text-blue-700">YVO</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">Create an Account</h1>
            <p className="text-sm text-slate-500">Enter your details below to get started with YVO.</p>
          </div>

          {msg ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              {msg}
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-slate-600">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className={inputClassName}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <input
                type="email"
                placeholder="john.doe@example.com"
                className={inputClassName}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Phone Number</label>
              <div className="mt-2 flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+91">+91 (IN)</option>
                  <option value="+61">+61 (AU)</option>
                </select>
                <input
                  type="tel"
                  placeholder="e.g., 555-555-5555"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">Include country code.</p>
            </div>

            {/* TEST ONLY */}
            <div>
              <label className="text-sm font-medium text-slate-600">Company ID (Testing)</label>
              <input
                type="text"
                placeholder="CMP-0001"
                className={inputClassName}
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-400">
                Later this will come after payment onboarding (auto).
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClassName}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                className={inputClassName}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-400">Must match the password above.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Business Type</label>
              <select
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              >
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              <span>OR CONTINUE WITH</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
              onClick={() => setMsg("Google signup will be added after backend /auth/google is ready.")}
            >
              <span className="text-base">G</span>
              Sign up with Google
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-blue-600">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <div className="mx-auto w-full max-w-6xl px-6 text-center text-xs text-slate-400">
          By creating an account, you agree to our Terms of Service and Privacy Policy. We&apos;re committed
          to protecting your data.
        </div>
      </footer>
    </div>
  );
}
