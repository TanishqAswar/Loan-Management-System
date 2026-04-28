import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import BorrowerDashboard from './pages/BorrowerDashboard';
import ApplyLoan from './pages/ApplyLoan';
import LoanList from './pages/LoanList';
import LoanDetail from './pages/LoanDetail';
import AdminStats from './pages/AdminStats';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/loans" replace />;
  return children;
}

function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'borrower' ? '/dashboard' : '/loans'} replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RoleHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={
              <PrivateRoute roles={['borrower']}><BorrowerDashboard /></PrivateRoute>
            } />
            <Route path="/apply" element={
              <PrivateRoute roles={['borrower']}><ApplyLoan /></PrivateRoute>
            } />
            <Route path="/my-loans" element={
              <PrivateRoute roles={['borrower']}><LoanList /></PrivateRoute>
            } />

            <Route path="/loans" element={
              <PrivateRoute><LoanList /></PrivateRoute>
            } />
            <Route path="/loans/:id" element={
              <PrivateRoute><LoanDetail /></PrivateRoute>
            } />

            <Route path="/admin" element={
              <PrivateRoute roles={['admin']}><AdminStats /></PrivateRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="top-right" theme="dark" autoClose={3000} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
