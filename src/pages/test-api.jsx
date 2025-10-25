// Page de test API pour diagnostiquer NetworkError
import { useState } from 'react';
import API_BASE from '../utils/apiBase';

export default function TestAPI() {
  const [results, setResults] = useState([]);

  const addResult = (title, content, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [{
      id: Date.now(),
      timestamp,
      title,
      content: typeof content === 'object' ? JSON.stringify(content, null, 2) : content,
      type
    }, ...prev]);
  };

  const test1 = async () => {
    try {
      addResult('Test 1: Démarrage', 'Fetch simple...', 'info');
      const response = await fetch(`${API_BASE}/auth/check.php`);
      const data = await response.json();
      addResult('Test 1: SUCCÈS ✅', { status: response.status, data }, 'success');
    } catch (error) {
      addResult('Test 1: ERREUR ❌', {
        name: error.name,
        message: error.message,
        stack: error.stack
      }, 'error');
    }
  };

  const test2 = async () => {
    try {
      addResult('Test 2: Démarrage', 'Fetch avec credentials...', 'info');
      const response = await fetch(`${API_BASE}/auth/check.php`, {
        credentials: 'include',
        mode: 'cors'
      });
      const data = await response.json();
      addResult('Test 2: SUCCÈS ✅', { status: response.status, data }, 'success');
    } catch (error) {
      addResult('Test 2: ERREUR ❌', error.message, 'error');
    }
  };

  const test3 = async () => {
    try {
      addResult('Test 3: Démarrage', 'Test Statistics endpoint...', 'info');
      const response = await fetch(`${API_BASE}/admin/statistics.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      addResult('Test 3: ' + (data.success ? 'SUCCÈS ✅' : 'Erreur'), data, data.success ? 'success' : 'error');
    } catch (error) {
      addResult('Test 3: ERREUR ❌', error.message, 'error');
    }
  };

  const loginTest = async () => {
    try {
      addResult('Login: Démarrage', 'Connexion admin...', 'info');
      const response = await fetch(`${API_BASE}/auth/login.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@gamezone.com',
          password: 'Admin123!'
        })
      });
      const data = await response.json();
      addResult('Login: ' + (data.success ? 'SUCCÈS ✅' : 'ERREUR'), data, data.success ? 'success' : 'error');
    } catch (error) {
      addResult('Login: ERREUR ❌', error.message, 'error');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#667eea' }}>🔍 Test API - Diagnostic NetworkError</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        API_BASE: <strong>{API_BASE}</strong><br />
        Origin: <strong>{window.location.origin}</strong><br />
        Port: <strong>{window.location.port}</strong>
      </p>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={test1} style={buttonStyle}>Test 1: Fetch Simple</button>
        <button onClick={test2} style={buttonStyle}>Test 2: Fetch + Credentials</button>
        <button onClick={test3} style={buttonStyle}>Test 3: Statistics</button>
        <button onClick={loginTest} style={buttonStyle}>Login Admin</button>
        <button onClick={() => setResults([])} style={{ ...buttonStyle, background: '#ef4444' }}>
          Effacer
        </button>
      </div>

      <div>
        {results.map(result => (
          <div key={result.id} style={{
            ...resultStyle,
            background: result.type === 'success' ? '#c6f6d5' : result.type === 'error' ? '#fed7d7' : '#bee3f8',
            color: result.type === 'success' ? '#22543d' : result.type === 'error' ? '#742a2a' : '#2c5282'
          }}>
            <strong>[{result.timestamp}] {result.title}</strong>
            <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {result.content}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '12px 24px',
  background: '#667eea',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  margin: '5px'
};

const resultStyle = {
  marginBottom: '15px',
  padding: '15px',
  borderRadius: '8px',
  fontSize: '12px'
};
