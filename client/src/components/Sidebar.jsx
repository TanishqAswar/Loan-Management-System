import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, CheckCircle, Banknote, CreditCard,
  Users, LogOut, ShieldCheck
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

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = NAV[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>LoanPro</h1>
        <p>Loan Management System</p>
      </div>
      <nav className="sidebar-nav">
        <span className="nav-label">Navigation</span>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            {item.icon} {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="sidebar-user-info">
            <div className="name">{user?.name}</div>
            <div className="role">{ROLE_LABELS[user?.role]}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
