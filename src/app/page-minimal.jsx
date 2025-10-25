import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Trophy, GamepadIcon, Zap, Clock } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <nav style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GamepadIcon size={32} />
          <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 'bold' }}>GameZone</h1>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => navigate('/auth/login')}
            style={{
              padding: '10px 25px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Se connecter
          </button>
          <button
            onClick={() => navigate('/auth/register')}
            style={{
              padding: '10px 25px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            S'inscrire
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '100px 40px',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{ 
          fontSize: '4rem', 
          marginBottom: '20px', 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Bienvenue chez GameZone
        </h2>
        <p style={{ 
          fontSize: '1.5rem', 
          color: 'rgba(255,255,255,0.8)', 
          maxWidth: '600px', 
          margin: '0 auto 40px' 
        }}>
          L'arcade gaming ultime. Jouez, progressez et gagnez des récompenses !
        </p>
        
        <button
          onClick={() => navigate('/auth/register')}
          style={{
            padding: '15px 40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            fontSize: '1.2rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Play size={20} />
          Commencer maintenant
        </button>
      </section>

      {/* Features */}
      <section style={{
        padding: '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h3 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '60px' }}>
          Nos Services
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px'
        }}>
          {[
            { icon: <GamepadIcon size={40} />, title: "Console Gaming", desc: "PS5, Xbox Series X, Nintendo Switch" },
            { icon: <Trophy size={40} />, title: "Tournois", desc: "Compétitions hebdomadaires avec prix" },
            { icon: <Users size={40} />, title: "Multijoueur", desc: "Jouez avec vos amis en local" },
            { icon: <Zap size={40} />, title: "Système de points", desc: "Gagnez des points et débloquez des récompenses" }
          ].map((feature, idx) => (
            <div key={idx} style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              padding: '30px',
              borderRadius: '15px',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s'
            }}>
              <div style={{ marginBottom: '15px', color: '#667eea' }}>
                {feature.icon}
              </div>
              <h4 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>{feature.title}</h4>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tarifs */}
      <section style={{
        padding: '80px 40px',
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '60px' }}>
            Nos Tarifs
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            {[
              { duree: "1 heure", prix: "100F", populaire: false },
              { duree: "3 heures", prix: "250F", populaire: true },
              { duree: "Journée complète", prix: "500F", populaire: false }
            ].map((tarif, idx) => (
              <div key={idx} style={{
                background: tarif.populaire 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255,255,255,0.05)',
                padding: '40px',
                borderRadius: '15px',
                border: tarif.populaire ? 'none' : '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
                position: 'relative'
              }}>
                {tarif.populaire && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#FFD700',
                    color: '#000',
                    padding: '5px 20px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    ⭐ Populaire
                  </div>
                )}
                <Clock size={32} style={{ margin: '0 auto 15px', display: 'block' }} />
                <h4 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{tarif.duree}</h4>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '20px 0' }}>{tarif.prix}</p>
                <button
                  onClick={() => navigate('/auth/register')}
                  style={{
                    padding: '12px 30px',
                    background: tarif.populaire ? 'white' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: tarif.populaire ? '#764ba2' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%',
                    marginTop: '20px',
                    fontSize: '1rem'
                  }}
                >
                  Choisir
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
          <GamepadIcon size={24} />
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>GameZone</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          © 2025 GameZone. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}
