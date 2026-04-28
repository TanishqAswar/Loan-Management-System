import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Landmark } from 'lucide-react';

const ROLES = [
  { value: 'borrower', label: '🧑 Borrower' },
  { value: 'sales_executive', label: '📈 Sales Executive' },
  { value: 'sanction_officer', label: '✅ Sanction Officer' },
  { value: 'disbursement_executive', label: '🏦 Disbursement Executive' },
  { value: 'collection_officer', label: '💳 Collection Officer' },
  { value: 'admin', label: '🛡️ Admin' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'borrower' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === 'borrower' ? '/dashboard' : '/loans');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-sky-500/15 blur-3xl" />

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
          <div className="auth-title">Create account</div>
          <div className="auth-sub">Join the platform to get started</div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                name="name" className="form-input"
                value={form.name} onChange={handle}
                required placeholder="John Doe"
              />
              {form.role === 'borrower' && (
                <small className="block mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  ⚠️ Ensure your name matches your PAN Card exactly.
                </small>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                name="email" type="email" className="form-input"
                value={form.email} onChange={handle}
                required placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password" type="password" className="form-input"
                value={form.password} onChange={handle}
                required minLength={6} placeholder="Min. 6 characters"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select name="role" className="form-input form-select" value={form.role} onChange={handle}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button
              className="btn btn-primary mt-2"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              <UserPlus size={16} /> {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--primary-light)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
