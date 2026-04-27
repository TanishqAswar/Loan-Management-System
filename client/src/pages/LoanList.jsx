import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { fmt, fmtDate, STATUS_BADGE } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search } from 'lucide-react';

const ROLE_TITLES = {
  sales_executive: { title: 'Leads Pipeline', sub: 'Track users who have registered but not yet applied' },
  sanction_officer: { title: 'Sanction Queue', sub: 'Review applied loans and generate agreements' },
  disbursement_executive: { title: 'Disbursement Queue', sub: 'Disburse sanctioned loans' },
  collection_officer: { title: 'Collections', sub: 'Record repayments for active loans' },
  admin: { title: 'All Loans', sub: 'Full system view' },
  borrower: { title: 'My Loans', sub: 'Your loan applications' },
};

export default function LoanList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const info = ROLE_TITLES[user?.role] || { title: 'Loans', sub: '' };

  useEffect(() => {
    const endpoint = user?.role === 'sales_executive' ? '/auth/leads' : '/loans';
    api.get(endpoint)
      .then(r => setLoans(r.data.loans || r.data.leads))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.role]);

  const filtered = loans.filter(item => {
    const q = search.toLowerCase();
    if (user?.role === 'sales_executive') {
      return item._id.toLowerCase().includes(q) || item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q);
    }
    return (
      item._id.toLowerCase().includes(q) ||
      item.borrower?.name?.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className="page-header flex justify-between items-center">
        <div><h2>{info.title}</h2><p>{info.sub}</p></div>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: 32, width: 220 }}
            placeholder="Search loans…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {loading ? <p className="text-muted">Loading...</p> : filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">📋</div><p>No records found.</p></div>
        ) : user?.role === 'sales_executive' ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--primary-light)' }}>#{u._id.slice(-8).toUpperCase()}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{fmtDate(u.createdAt)}</td>
                    <td><span className="badge badge-yellow">No Application Yet</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Loan ID</th>
                  {user?.role !== 'borrower' && <th>Borrower</th>}
                  <th>Amount</th>
                  <th>Tenure</th>
                  <th>Status</th>
                  <th>Applied</th>
                  {['borrower', 'collection_officer', 'admin'].includes(user?.role) && <th>Outstanding</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/loans/${l._id}`)}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--primary-light)' }}>#{l._id.slice(-8).toUpperCase()}</td>
                    {user?.role !== 'borrower' && <td>{l.borrower?.name || '—'}</td>}
                    <td>{l.loanDetails?.amount ? fmt(l.loanDetails.amount) : '—'}</td>
                    <td>{l.loanDetails?.tenure ? `${l.loanDetails.tenure}d` : '—'}</td>
                    <td><span className={STATUS_BADGE[l.status]}>{l.status}</span></td>
                    <td>{fmtDate(l.createdAt)}</td>
                    {['borrower', 'collection_officer', 'admin'].includes(user?.role) && <td>{l.outstandingBalance != null ? fmt(l.outstandingBalance) : '—'}</td>}
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
