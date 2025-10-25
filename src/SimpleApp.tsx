export default function SimpleApp() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        🎮 GameZone
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
        Application en ligne !
      </p>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '2rem',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ marginBottom: '1rem' }}>✅ React fonctionne</p>
        <p style={{ marginBottom: '1rem' }}>✅ Vite build OK</p>
        <p style={{ marginBottom: '1rem' }}>✅ Vercel déploiement OK</p>
        <p style={{ fontSize: '2rem', textAlign: 'center', marginTop: '1rem' }}>
          🎉
        </p>
      </div>
    </div>
  );
}
