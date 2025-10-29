'use client';
// Page de test API pour diagnostiquer NetworkError
import { useState } from 'react';
import API_BASE from '../../utils/apiBase';

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
          email: 'admin@gmail.com',
          password: 'demo123'
        })
      });
      const data = await response.json();
      addResult('Login: ' + (response.ok ? 'SUCCÈS ✅' : 'ERREUR'), { status: response.status, data }, response.ok ? 'success' : 'error');

      // Enchaîner sur me.php
      const meRes = await fetch(`${API_BASE}/auth/me.php`, { credentials: 'include' });
      const meData = await meRes.json();
      addResult('me.php', { status: meRes.status, data: meData }, meRes.ok && meData?.user ? 'success' : 'error');

      // Enchaîner sur dashboard admin
      const dashRes = await fetch(`${API_BASE}/admin/dashboard_stats.php`, { credentials: 'include' });
      const dashData = await dashRes.json();
      addResult('dashboard_stats.php', { status: dashRes.status, data: dashData }, dashRes.ok ? 'success' : 'error');
    } catch (error) {
      addResult('Login: ERREUR ❌', error.message, 'error');
    }
  };

  const createAdmin = async () => {
    try {
      addResult('Créer Admin', 'Appel create_admin.php...', 'info');
      const res = await fetch(`${API_BASE}/create_admin.php`, { credentials: 'include' });
      const data = await res.json();
      addResult('Créer Admin', { status: res.status, data }, res.ok ? 'success' : 'error');
    } catch (error) {
      addResult('Créer Admin: ERREUR ❌', error.message, 'error');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif', background: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: '#667eea', marginBottom: '10px' }}>🔍 Test API - Diagnostic NetworkError</h1>
      <p style={{ marginBottom: '20px', color: '#666', background: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
        <strong>API_BASE:</strong> {API_BASE}<br />
        <strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}<br />
        <strong>Port:</strong> {typeof window !== 'undefined' ? window.location.port : 'N/A'}
      </p>

      <div style={{ marginBottom: '20px', background: '#fef3c7', padding: '15px', borderRadius: '8px', border: '2px solid #f59e0b' }}>
        <strong>📌 Instructions:</strong>
        <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Cliquez sur "Test 1: Fetch Simple"</li>
          <li>Regardez le résultat ci-dessous</li>
          <li>Si ERREUR ❌, copiez le message COMPLET</li>
          <li>Envoyez-moi le message pour que je corrige</li>
        </ol>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={test1} style={buttonStyle}>Test 1: Fetch Simple</button>
        <button onClick={test2} style={buttonStyle}>Test 2: Fetch + Credentials</button>
        <button onClick={test3} style={buttonStyle}>Test 3: Statistics</button>
        <button onClick={loginTest} style={buttonStyle}>Login Admin</button>
        <button onClick={createAdmin} style={buttonStyle}>Créer Admin</button>
        <button onClick={() => setResults([])} style={{ ...buttonStyle, background: '#ef4444' }}>
          Effacer
        </button>
      </div>

      <div>
        {results.map(result => (
          <div key={result.id} style={{
            ...resultStyle,
            background: result.type === 'success' ? '#c6f6d5' : result.type === 'error' ? '#fed7d7' : '#bee3f8',
            color: result.type === 'success' ? '#22543d' : result.type === 'error' ? '#742a2a' : '#2c5282',
            border: `2px solid ${result.type === 'success' ? '#48bb78' : result.type === 'error' ? '#f56565' : '#4299e1'}`
          }}>
            <strong>[{result.timestamp}] {result.title}</strong>
            <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '11px' }}>
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
  margin: '5px',
  fontSize: '14px'
};

const resultStyle = {
  marginBottom: '15px',
  padding: '15px',
  borderRadius: '8px',
  fontSize: '13px'
};
