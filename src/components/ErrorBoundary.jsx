import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('❌ ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
          color: 'white',
          textAlign: 'center',
          fontFamily: 'system-ui',
          padding: '20px'
        }}>
          <div>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>💥 APPLICATION ERROR</h1>
            <p style={{ fontSize: '1.3rem', marginBottom: '30px' }}>
              Une erreur s'est produite dans l'application
            </p>
            
            <div style={{ 
              background: 'rgba(0,0,0,0.3)', 
              padding: '20px', 
              borderRadius: '10px',
              textAlign: 'left',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <h2 style={{ color: '#ff9ff3', marginBottom: '15px' }}>Details:</h2>
              <p><strong>Message:</strong> {this.state.error?.message}</p>
              <p><strong>Component:</strong> {this.props.componentName || 'Unknown'}</p>
              {this.state.errorInfo && (
                <details style={{ 
                  whiteSpace: 'pre-wrap',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '15px',
                  borderRadius: '5px',
                  marginTop: '15px'
                }}>
                  <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>Stack Trace</summary>
                  {this.state.errorInfo.componentStack}
                </details>
              )}
            </div>
            
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '30px',
                padding: '15px 30px',
                fontSize: '1.2rem',
                background: '#fff',
                color: '#ee5a24',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}