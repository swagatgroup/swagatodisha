const fs = require('fs');
const file = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/main.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldRender = `
    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif',
                    color: '#e74c3c'
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
                            cursor: 'pointer'
                        }}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }
`;

const newRender = `
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
`;

if (content.includes('<h2>Something went wrong</h2>')) {
    content = content.replace(oldRender, newRender);
    fs.writeFileSync(file, content);
    console.log("Successfully patched main.jsx ErrorBoundary to display stack trace.");
} else {
    console.log("Could not find the old render block in main.jsx");
}
