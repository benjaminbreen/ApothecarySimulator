// ErrorBoundary.jsx
// Catches React errors and prevents full app crashes

import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game crashed:', error, errorInfo);

    // Save crash log to localStorage for debugging
    try {
      const crashLog = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      };
      localStorage.setItem('lastCrashLog', JSON.stringify(crashLog));
    } catch (e) {
      console.error('Failed to save crash log:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#1a1a1a',
          color: '#e0e0e0'
        }}>
          <div style={{
            maxWidth: '600px',
            textAlign: 'center',
            backgroundColor: '#2a2a2a',
            padding: '2rem',
            borderRadius: '8px',
            border: '1px solid #444'
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ff6b6b' }}>
              ⚠️ Game Error
            </h1>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              The game encountered an error and needs to restart.
            </p>
            <p style={{ fontSize: '0.9rem', marginBottom: '2rem', color: '#aaa' }}>
              Your save data has been preserved. The error has been logged.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                backgroundColor: '#4a9eff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Reload Game
            </button>
            {this.state.error && (
              <details style={{ marginTop: '2rem', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#4a9eff' }}>
                  Technical Details
                </summary>
                <pre style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: '#1a1a1a',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
