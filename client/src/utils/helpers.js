export const STATUS_BADGE = {
  APPLIED: 'badge badge-applied',
  APPROVED: 'badge badge-approved',
  REJECTED: 'badge badge-rejected',
  SANCTIONED: 'badge badge-sanctioned',
  DISBURSED: 'badge badge-disbursed',
  CLOSED: 'badge badge-closed',
};

export const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
