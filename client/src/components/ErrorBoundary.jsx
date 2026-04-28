import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('❌ [ErrorBoundary] Uncaught render error:', error);
    console.error('   Component stack:', info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', gap: '12px',
          fontFamily: 'Inter, sans-serif', color: '#f87171', background: '#0f172a'
        }}>
          <h1 style={{ fontSize: '1.5rem' }}>⚠️ Something went wrong</h1>
          <p style={{ color: '#94a3b8', maxWidth: 480, textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '0.9rem'
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
