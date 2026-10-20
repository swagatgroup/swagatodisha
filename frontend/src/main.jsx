import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Icon font for the `fa-solid ...` classes used across the app (was never loaded, so those icons rendered blank)
import '@fortawesome/fontawesome-free/css/all.min.css'
import './index.css'
import './utils/uppercaseInputs'

// Error Boundary Component
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
                <div style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontFamily: 'monospace',
                    color: '#e74c3c',
                    backgroundColor: '#fff',
                    maxWidth: '100vw',
                    overflowX: 'auto'
                }}>
                    <h2>Something went wrong</h2>
                    <p>Please refresh the page or contact support if the problem persists.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginBottom: '20px'
                        }}
                    >
                        Refresh Page
                    </button>
                    <div style={{ padding: '15px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '5px' }}>
                        <h3 style={{ marginTop: 0 }}>Error Details:</h3>
                        <p style={{ fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</p>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', textAlign: 'left', margin: 0 }}>
                            {this.state.error && this.state.error.stack}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// App component mounting
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);
