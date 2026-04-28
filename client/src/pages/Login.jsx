import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Landmark } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'borrower' ? '/dashboard' : '/loans');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-500/15 blur-3xl" />

      <div className="auth-box relative z-10">
        <div className="auth-logo">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Landmark size={20} className="text-white" />
            </div>
          </div>
          <h1>LoanPro</h1>
          <p>Loan Management System</p>
        </div>

        <div className="auth-card">
          <div className="auth-title">Welcome back</div>
          <div className="auth-sub">Sign in to your account to continue</div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                name="email" type="email" className="form-input"
                value={form.email} onChange={handle} required
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password" type="password" className="form-input"
                value={form.password} onChange={handle} required
                placeholder="••••••••"
              />
            </div>
            <button
              className="btn btn-primary w-full justify-center mt-2"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              <LogIn size={16} /> {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
            No account?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--primary-light)' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
