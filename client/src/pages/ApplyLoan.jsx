import React, { useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Upload, Calculator } from 'lucide-react';

const STEPS = ['Personal Details', 'Upload Document', 'Loan Configuration'];

export default function ApplyLoan() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loanId, setLoanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1
  const [personal, setPersonal] = useState({
    fullName: '', pan: '', dateOfBirth: '', monthlySalary: '', employmentMode: 'salaried'
  });

  // Step 2
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);

  // Step 3
  const [loanCfg, setLoanCfg] = useState({ amount: 100000, tenure: 90 });
  const [preview, setPreview] = useState(null);

  const calcPreview = (amount, tenure) => {
    const rate = 12;
    const interest = (amount * rate * tenure) / (365 * 100);
    setPreview({ interest: Math.round(interest), total: Math.round(amount + interest) });
  };

  const handleStep1 = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/loans/step1', personal);
      setLoanId(data.loan._id);
      setStep(1);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a file'); return; }
    setError(''); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      await api.post(`/loans/${loanId}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStep(2);
    } catch (err) { setError(err.response?.data?.message || 'Upload failed'); }
    finally { setLoading(false); }
  };

  const handleStep3 = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post(`/loans/${loanId}/configure`, loanCfg);
      toast.success('Loan application submitted successfully!');
      navigate(`/loans/${loanId}`);
    } catch (err) {
      const msg = err.response?.data?.reason || err.response?.data?.message || 'Failed';
      setError(msg);
      if (err.response?.status === 422) {
        toast.error('BRE check failed: ' + msg);
        setTimeout(() => navigate('/my-loans'), 2500);
      }
    } finally { setLoading(false); }
  };

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <Layout>
      <div className="page-header"><h2>Apply for Loan</h2><p>Complete the 3-step application process</p></div>

      {/* Steps indicator */}
      <div className="steps">
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className={`step-line${i <= step ? ' done' : ''}`} />}
            <div className={`step${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}>
              <div className="step-circle">{i < step ? '✓' : i + 1}</div>
              <div className="step-label">{s}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="card" style={{ maxWidth: 680 }}>
        {error && <div className="alert alert-danger">{error}</div>}

        {/* STEP 1 */}
        {step === 0 && (
          <form onSubmit={handleStep1}>
            <div className="section-title">Personal Information</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={personal.fullName}
                  onChange={e => setPersonal({ ...personal, fullName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">PAN Number</label>
                <input className="form-input" maxLength={10} style={{ textTransform: 'uppercase' }}
                  value={personal.pan} onChange={e => setPersonal({ ...personal, pan: e.target.value.toUpperCase() })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-input" value={personal.dateOfBirth}
                  onChange={e => setPersonal({ ...personal, dateOfBirth: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Salary (₹)</label>
                <input type="number" className="form-input" value={personal.monthlySalary}
                  onChange={e => setPersonal({ ...personal, monthlySalary: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Employment Mode</label>
              <select className="form-input form-select" value={personal.employmentMode}
                onChange={e => setPersonal({ ...personal, employmentMode: e.target.value })}>
                <option value="salaried">Salaried</option>
                <option value="self_employed">Self Employed</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Next →'}</button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 1 && (
          <form onSubmit={handleStep2}>
            <div className="section-title">Upload Supporting Document</div>
            <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>Upload a PDF, JPG, or PNG (max 5MB). This can be salary slip, bank statement, or ID proof.</p>
            <div
              className={`upload-box${drag ? ' drag' : ''}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); setFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <Upload size={36} style={{ color: 'var(--primary-light)', margin: '0 auto 12px' }} />
              {file ? (
                <p style={{ color: 'var(--success)' }}>✓ {file.name}</p>
              ) : (
                <>
                  <p style={{ fontWeight: 600 }}>Drop file here or click to browse</p>
                  <p className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>PDF, JPG, PNG up to 5MB</p>
                </>
              )}
              <input id="file-input" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
                onChange={e => setFile(e.target.files[0])} />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
              <button className="btn btn-primary" disabled={loading}>{loading ? 'Uploading...' : 'Next →'}</button>
            </div>
          </form>
        )}

        {/* STEP 3 */}
        {step === 2 && (
          <form onSubmit={handleStep3}>
            <div className="section-title">Loan Configuration</div>
            <div className="form-group">
              <label className="form-label">Loan Amount (₹50,000 – ₹5,00,000)</label>
              <input type="range" min="50000" max="500000" step="5000"
                value={loanCfg.amount} style={{ width: '100%', accentColor: 'var(--primary)' }}
                onChange={e => { const v = +e.target.value; setLoanCfg({ ...loanCfg, amount: v }); calcPreview(v, loanCfg.tenure); }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>₹50,000</span><span style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '1rem' }}>{fmt(loanCfg.amount)}</span><span>₹5,00,000</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tenure (30 – 365 days)</label>
              <input type="range" min="30" max="365" step="5"
                value={loanCfg.tenure} style={{ width: '100%', accentColor: 'var(--primary)' }}
                onChange={e => { const v = +e.target.value; setLoanCfg({ ...loanCfg, tenure: v }); calcPreview(loanCfg.amount, v); }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>30 days</span><span style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '1rem' }}>{loanCfg.tenure} days</span><span>365 days</span>
              </div>
            </div>
            {preview && (
              <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Principal</div><div style={{ fontWeight: 700 }}>{fmt(loanCfg.amount)}</div></div>
                  <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Interest (12% p.a.)</div><div style={{ fontWeight: 700, color: 'var(--warning)' }}>{fmt(preview.interest)}</div></div>
                  <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Repayable</div><div style={{ fontWeight: 700, color: 'var(--success)' }}>{fmt(preview.total)}</div></div>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" disabled={loading}
                onClick={() => calcPreview(loanCfg.amount, loanCfg.tenure)}>
                <Calculator size={15} /> {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
