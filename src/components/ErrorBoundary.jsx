import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null, componentStack: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ componentStack: errorInfo.componentStack });
    console.error('ErrorBoundary caught:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#c00', fontFamily: 'monospace', fontSize: 13 }}>
          <h3>Что-то пошло не так</h3>
          <p><b>{this.state.error.message}</b></p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
            <summary>Стек ошибки</summary>
            {this.state.error.stack}
          </details>
          {this.state.componentStack && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
              <summary>Стек компонентов</summary>
              {this.state.componentStack}
            </details>
          )}
          <button
            onClick={() => this.setState({ error: null, componentStack: null })}
            style={{ marginTop: 12, padding: '8px 16px', background: '#667eea', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
