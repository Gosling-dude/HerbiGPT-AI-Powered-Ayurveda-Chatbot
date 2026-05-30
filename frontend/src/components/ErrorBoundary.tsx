import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#e2e8f0',
          fontFamily: "'Inter', sans-serif",
          padding: '2rem',
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '500px',
            padding: '3rem',
            borderRadius: '20px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#a5b4fc' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              HerbiGPT encountered an unexpected error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
