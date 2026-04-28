import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, CheckCircle, Banknote, CreditCard,
  Users, LogOut, ShieldCheck, Landmark
} from 'lucide-react';

const NAV = {
  borrower: [
    { to: '/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { to: '/apply', icon: <FileText size={16} />, label: 'Apply for Loan' },
    { to: '/my-loans', icon: <CreditCard size={16} />, label: 'My Loans' },
  ],
  sales_executive: [
    { to: '/loans', icon: <FileText size={16} />, label: 'Loan Applications' },
  ],
  sanction_officer: [
    { to: '/loans', icon: <CheckCircle size={16} />, label: 'Sanction Queue' },
  ],
  disbursement_executive: [
    { to: '/loans', icon: <Banknote size={16} />, label: 'Disbursement Queue' },
  ],
  collection_officer: [
    { to: '/loans', icon: <CreditCard size={16} />, label: 'Collections' },
  ],
  admin: [
    { to: '/loans', icon: <FileText size={16} />, label: 'All Loans' },
    { to: '/admin', icon: <ShieldCheck size={16} />, label: 'Admin Stats' },
  ],
};

const ROLE_LABELS = {
  borrower: 'Borrower',
  sales_executive: 'Sales Executive',
  sanction_officer: 'Sanction Officer',
  disbursement_executive: 'Disbursement Exec',
  collection_officer: 'Collection Officer',
  admin: 'Administrator',
};

const ROLE_COLORS = {
  borrower: 'from-indigo-500 to-sky-500',
  sales_executive: 'from-emerald-500 to-teal-500',
  sanction_officer: 'from-violet-500 to-indigo-500',
  disbursement_executive: 'from-amber-500 to-orange-500',
  collection_officer: 'from-rose-500 to-pink-500',
  admin: 'from-fuchsia-500 to-purple-500',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = NAV[user?.role] || [];
  const gradient = ROLE_COLORS[user?.role] || 'from-indigo-500 to-sky-500';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Landmark size={15} className="text-white" />
          </div>
          <h1 className="!text-transparent !bg-clip-text" style={{ background: 'linear-gradient(135deg, #818cf8, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LoanPro
          </h1>
        </div>
        <p>Loan Management System</p>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <span className="nav-label">Navigation</span>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className={`flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200 ${false ? `bg-gradient-to-br ${gradient}` : ''}`}>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className={`avatar bg-gradient-to-br ${gradient} shadow-lg`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="name">{user?.name}</div>
            <div className="role">{ROLE_LABELS[user?.role]}</div>
          </div>
          <button
            className="logout-btn group"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={16} className="group-hover:text-red-400 transition-colors duration-200" />
          </button>
        </div>
      </div>
    </aside>
  );
}
