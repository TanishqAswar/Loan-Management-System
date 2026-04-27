import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { fmt, fmtDate, STATUS_BADGE } from '../utils/helpers';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { ArrowLeft, CheckCircle, XCircle, Banknote, CreditCard } from 'lucide-react';

export default function LoanDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'reject' | 'payment'
  const [rejReason, setRejReason] = useState('');
  const [payment, setPayment] = useState({ utrNumber: '', amount: '', date: '' });
  const [acting, setActing] = useState(false);

  const load = () => {
    api.get(`/loans/${id}`).then(r => setLoan(r.data.loan)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const act = async (endpoint, method = 'patch', body = {}) => {
    setActing(true);
    try {
      await api[method](`/loans/${id}/${endpoint}`, body);
      toast.success('Action completed');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActing(false); setModal(null); }
  };

  if (loading) return <Layout><p className="text-muted" style={{ padding: 32 }}>Loading...</p></Layout>;
  if (!loan) return <Layout><p className="text-muted" style={{ padding: 32 }}>Loan not found.</p></Layout>;

  const paidPct = loan.loanDetails?.totalRepayable
    ? Math.round(((loan.loanDetails.totalRepayable - loan.outstandingBalance) / loan.loanDetails.totalRepayable) * 100)
    : 0;

  return (
    <Layout>
      <div className="page-header flex justify-between items-center">
        <div>
          <button className="btn btn-outline btn-sm mb-2" onClick={() => navigate(-1)}><ArrowLeft size={14} /> Back</button>
          <h2>Loan #{loan._id.slice(-8).toUpperCase()}</h2>
          <p>Submitted {fmtDate(loan.createdAt)}</p>
        </div>
        <span className={STATUS_BADGE[loan.status]} style={{ fontSize: '0.9rem', padding: '6px 16px' }}>{loan.status}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Personal Details */}
        <div className="card">
          <div className="section-title">Personal Details</div>
          <div className="detail-grid">
            {[
              ['Full Name', loan.personalDetails?.fullName],
              ['PAN', loan.personalDetails?.pan],
              ['Date of Birth', fmtDate(loan.personalDetails?.dateOfBirth)],
              ['Monthly Salary', loan.personalDetails?.monthlySalary ? fmt(loan.personalDetails.monthlySalary) : '—'],
              ['Employment', loan.personalDetails?.employmentMode?.replace('_', ' ')],
            ].map(([k, v]) => (
              <div key={k} className="detail-item"><label>{k}</label><span>{v || '—'}</span></div>
            ))}
          </div>
        </div>

        {/* Loan Details */}
        <div className="card">
          <div className="section-title">Loan Details</div>
          {loan.loanDetails?.amount ? (
            <>
              <div className="detail-grid">
                {[
                  ['Principal', fmt(loan.loanDetails.amount)],
                  ['Tenure', `${loan.loanDetails.tenure} days`],
                  ['Interest Rate', `${loan.loanDetails.interestRate}% p.a.`],
                  ['Interest', fmt(loan.loanDetails.interest)],
                  ['Total Repayable', fmt(loan.loanDetails.totalRepayable)],
                  ['Outstanding', fmt(loan.outstandingBalance || 0)],
                ].map(([k, v]) => (
                  <div key={k} className="detail-item"><label>{k}</label><span>{v}</span></div>
                ))}
              </div>
              {loan.status === 'DISBURSED' && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                    <span className="text-muted">Repayment Progress</span>
                    <span style={{ fontWeight: 600 }}>{paidPct}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${paidPct}%` }} /></div>
                </div>
              )}
            </>
          ) : <p className="text-muted">Not configured yet</p>}
        </div>
      </div>

      {/* Document */}
      {loan.documentUrl && (
        <div className="card mb-4" style={{ marginBottom: 20 }}>
          <div className="section-title">Supporting Document</div>
          <a href={`http://localhost:5000${loan.documentUrl}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
            📎 View Document
          </a>
        </div>
      )}

      {/* BRE Rejection */}
      {loan.breRejected && (
        <div className="alert alert-danger mb-4" style={{ marginBottom: 20 }}>
          <strong>BRE Rejection:</strong> {loan.breReason}
        </div>
      )}

      {/* Rejection Reason */}
      {loan.rejectionReason && (
        <div className="alert alert-danger mb-4" style={{ marginBottom: 20 }}>
          <strong>Rejection Reason:</strong> {loan.rejectionReason}
        </div>
      )}

      {/* Role Actions */}
      <div className="card">
        <div className="section-title">Actions</div>

        {user.role === 'sanction_officer' && loan.status === 'APPLIED' && (
          <div className="flex gap-2">
            <button className="btn btn-success" disabled={acting} onClick={() => act('review', 'patch', { action: 'approve' })}>
              <CheckCircle size={15} /> Approve
            </button>
            <button className="btn btn-danger" disabled={acting} onClick={() => setModal('reject')}>
              <XCircle size={15} /> Reject
            </button>
          </div>
        )}

        {user.role === 'sanction_officer' && loan.status === 'APPROVED' && (
          <button className="btn btn-primary" disabled={acting} onClick={() => act('sanction')}>
            <CheckCircle size={15} /> Generate Agreement & Sanction
          </button>
        )}

        {user.role === 'disbursement_executive' && loan.status === 'SANCTIONED' && (
          <div>
            {loan.agreementUrl && (
              <a href={`http://localhost:5000${loan.agreementUrl}`} className="btn btn-outline btn-sm mb-2" style={{ marginRight: 8 }}>
                📄 View Agreement
              </a>
            )}
            <button className="btn btn-success" disabled={acting} onClick={() => act('disburse')}>
              <Banknote size={15} /> Disburse Loan
            </button>
          </div>
        )}

        {user.role === 'collection_officer' && loan.status === 'DISBURSED' && (
          <button className="btn btn-primary" onClick={() => setModal('payment')}>
            <CreditCard size={15} /> Record Payment
          </button>
        )}

        {/* Admin can do everything */}
        {user.role === 'admin' && (
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {loan.status === 'APPLIED' && <>
              <button className="btn btn-success btn-sm" disabled={acting} onClick={() => act('review', 'patch', { action: 'approve' })}>Approve</button>
              <button className="btn btn-danger btn-sm" disabled={acting} onClick={() => setModal('reject')}>Reject</button>
            </>}
            {loan.status === 'APPROVED' && <button className="btn btn-primary btn-sm" disabled={acting} onClick={() => act('sanction')}>Sanction</button>}
            {loan.status === 'SANCTIONED' && <button className="btn btn-success btn-sm" disabled={acting} onClick={() => act('disburse')}>Disburse</button>}
            {loan.status === 'DISBURSED' && <button className="btn btn-primary btn-sm" onClick={() => setModal('payment')}>Record Payment</button>}
          </div>
        )}

        {['REJECTED', 'CLOSED'].includes(loan.status) && <p className="text-muted">No actions available for this loan.</p>}
      </div>

      {/* Payments history */}
      {loan.payments?.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="section-title">Payment History</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>UTR Number</th><th>Amount</th><th>Date</th><th>Recorded By</th></tr></thead>
              <tbody>
                {loan.payments.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontFamily: 'monospace' }}>{p.utrNumber}</td>
                    <td style={{ color: 'var(--success)' }}>{fmt(p.amount)}</td>
                    <td>{fmtDate(p.date)}</td>
                    <td>{p.recordedBy?.name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {modal === 'reject' && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Reject Loan Application</div>
            <div className="form-group">
              <label className="form-label">Rejection Reason</label>
              <textarea className="form-input" rows={3} value={rejReason} onChange={e => setRejReason(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={acting}
                onClick={() => act('review', 'patch', { action: 'reject', rejectionReason: rejReason })}>
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {modal === 'payment' && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Record Payment</div>
            {[['UTR Number', 'utrNumber', 'text'], ['Amount (₹)', 'amount', 'number'], ['Payment Date', 'date', 'date']].map(([label, key, type]) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <input type={type} className="form-input" value={payment[key]}
                  onChange={e => setPayment({ ...payment, [key]: e.target.value })} />
              </div>
            ))}
            <div className="flex gap-2">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-success" disabled={acting}
                onClick={() => act('payment', 'post', { ...payment, amount: +payment.amount })}>
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
