import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { fmt, fmtDate, STATUS_BADGE } from '../utils/helpers';
import { FileText, TrendingUp, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BorrowerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/loans').then(r => setLoans(r.data.loans)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filteredLoans = loans.filter(l => l.loanDetails?.amount);
  const total = filteredLoans.length;
  const active = filteredLoans.filter(l => ['DISBURSED', 'SANCTIONED', 'APPLIED', 'APPROVED'].includes(l.status)).length;
  const closed = filteredLoans.filter(l => l.status === 'CLOSED').length;
  const totalBorrowed = filteredLoans
    .filter(l => ['DISBURSED', 'CLOSED'].includes(l.status))
    .reduce((a, l) => a + (l.loanDetails?.amount || 0), 0);

  return (
    <Layout>
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>Welcome, {user.name} 👋</h2>
          <p>Here's an overview of your loan portfolio</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/apply')}>
          <Plus size={16} /> Apply for Loan
        </button>
      </div>

      <div className="stats-grid">
        {[
          { icon: <FileText size={22} />, cls: 'indigo', val: total, label: 'Total Applications' },
          { icon: <TrendingUp size={22} />, cls: 'blue', val: active, label: 'Active Loans' },
          { icon: <CheckCircle size={22} />, cls: 'green', val: closed, label: 'Closed Loans' },
          { icon: <AlertCircle size={22} />, cls: 'amber', val: fmt(totalBorrowed), label: 'Total Borrowed' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div><div className="stat-value">{s.val}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title">My Loan Applications</div>
        {loading ? <p className="text-muted">Loading...</p> : filteredLoans.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📄</div>
            <p>No loan applications yet.</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/apply')}>Apply Now</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Application</th><th>Amount</th><th>Tenure</th><th>Applied</th><th>Status</th><th>Outstanding</th></tr>
              </thead>
              <tbody>
                {filteredLoans.map(l => (
                  <tr key={l._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/loans/${l._id}`)}>
                    <td>#{l._id.slice(-6).toUpperCase()}</td>
                    <td>{l.loanDetails?.amount ? fmt(l.loanDetails.amount) : '—'}</td>
                    <td>{l.loanDetails?.tenure ? `${l.loanDetails.tenure} days` : '—'}</td>
                    <td>{fmtDate(l.createdAt)}</td>
                    <td><span className={STATUS_BADGE[l.status]}>{l.status}</span></td>
                    <td>{['DISBURSED', 'CLOSED'].includes(l.status) ? fmt(l.outstandingBalance) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
