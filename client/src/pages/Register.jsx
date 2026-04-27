import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const ROLES = [
  { value: 'borrower', label: 'Borrower' },
  { value: 'sales_executive', label: 'Sales Executive' },
  { value: 'sanction_officer', label: 'Sanction Officer' },
  { value: 'disbursement_executive', label: 'Disbursement Executive' },
  { value: 'collection_officer', label: 'Collection Officer' },
  { value: 'admin', label: 'Admin' },
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
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
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
              <input name="name" className="form-input" value={form.name} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" type="email" className="form-input" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-input" value={form.password} onChange={handle} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select name="role" className="form-input form-select" value={form.role} onChange={handle}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              <UserPlus size={16} /> {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
