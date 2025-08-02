import React from 'react';
import { Card } from '../styles/StyledComponents';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#6c757d'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ margin: '16px 0 8px 0', color: '#495057' }}>
              Something went wrong
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px' }}>
              {this.props.fallbackMessage || 'An error occurred while rendering this component.'}
            </p>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ 
                padding: '8px 16px', 
                background: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 