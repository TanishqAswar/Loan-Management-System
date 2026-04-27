import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { fmt } from '../utils/helpers';
import { BarChart2, Users, TrendingUp, CheckCircle } from 'lucide-react';

export default function AdminStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/loans/admin/stats').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const STATUS_COLORS = {
    APPLIED: 'var(--secondary)', APPROVED: 'var(--success)', REJECTED: 'var(--danger)',
    SANCTIONED: 'var(--primary)', DISBURSED: 'var(--warning)', CLOSED: 'var(--text-muted)'
  };

  return (
    <Layout>
      <div className="page-header"><h2>Admin Statistics</h2><p>Full system loan analytics</p></div>
      {loading ? <p className="text-muted">Loading...</p> : !data ? <p className="text-muted">Failed to load</p> : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon indigo"><BarChart2 size={22} /></div>
              <div><div className="stat-value">{data.totalLoans}</div><div className="stat-label">Total Loans</div></div>
            </div>
            {data.stats.map(s => (
              <div key={s._id} className="stat-card">
                <div className="stat-icon" style={{ background: `${STATUS_COLORS[s._id]}22` }}>
                  <TrendingUp size={22} style={{ color: STATUS_COLORS[s._id] }} />
                </div>
                <div>
                  <div className="stat-value">{s.count}</div>
                  <div className="stat-label">{s._id}</div>
                  {s.totalAmount > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmt(s.totalAmount)}</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-title">Status Breakdown</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Status</th><th>Count</th><th>Total Amount</th></tr></thead>
                <tbody>
                  {data.stats.map(s => (
                    <tr key={s._id}>
                      <td><span className={`badge badge-${s._id.toLowerCase()}`}>{s._id}</span></td>
                      <td>{s.count}</td>
                      <td>{s.totalAmount > 0 ? fmt(s.totalAmount) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
