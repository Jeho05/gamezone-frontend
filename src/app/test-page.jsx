import { useState } from 'react';

export default function TestPage() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
        ✅ GameZone Test Page
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>
        If you can see this, React is working!
      </p>
      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '15px 30px',
            fontSize: '1.2rem',
            background: '#fff',
            color: '#764ba2',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Count: {count}
        </button>
      </div>
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '20px', 
        borderRadius: '10px',
        maxWidth: '600px'
      }}>
        <h2 style={{ marginBottom: '15px' }}>Debug Info:</h2>
        <p>Environment: {process.env.NODE_ENV || 'undefined'}</p>
        <p>API Base: {process.env.NEXT_PUBLIC_API_BASE || 'undefined'}</p>
      </div>
    </div>
  );
}