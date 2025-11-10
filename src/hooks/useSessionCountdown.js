import { useState, useEffect, useRef } from 'react';

/**
 * Hook personnalisé pour gérer le décompte de session côté client
 * Met à jour l'affichage chaque seconde sans requête serveur
 * Synchronise avec le serveur toutes les 30 secondes
 */
export function useSessionCountdown(initialSession, onSessionEnd) {
  const [session, setSession] = useState(initialSession);
  const [localRemainingMinutes, setLocalRemainingMinutes] = useState(
    initialSession?.remaining_minutes ?? null
  );
  const [localSeconds, setLocalSeconds] = useState(0);
  const lastUpdateRef = useRef(Date.now());
  const syncIntervalRef = useRef(null);

  // Décompte local chaque seconde
  useEffect(() => {
    if (!session || session.status !== 'active' || localRemainingMinutes === null) {
      return;
    }
    
    // Debug: vérifier les valeurs initiales
    console.log('[Countdown] Starting countdown:', {
      total: session.total_minutes,
      used: session.used_minutes,
      remaining: localRemainingMinutes,
      status: session.status
    });

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastUpdateRef.current) / 1000);

      setLocalSeconds((prev) => {
        const newSeconds = prev - 1;
        
        if (newSeconds < 0) {
          // Une minute s'est écoulée
          setLocalRemainingMinutes((prevMin) => {
            const newMin = Math.max(0, prevMin - 1);
            
            // Si on arrive à 0, la session est terminée
            if (newMin === 0) {
              if (onSessionEnd) {
                onSessionEnd();
              }
            }
            
            return newMin;
          });
          return 59;
        }
        
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session, onSessionEnd]);

  // Mettre à jour quand la session change (sync serveur)
  useEffect(() => {
    if (initialSession) {
      console.log('[Countdown] Session updated from server:', {
        total: initialSession.total_minutes,
        used: initialSession.used_minutes,
        remaining: initialSession.remaining_minutes,
        status: initialSession.status
      });
      setSession(initialSession);
      setLocalRemainingMinutes(initialSession.remaining_minutes ?? 0);
      setLocalSeconds(0);
      lastUpdateRef.current = Date.now();
    }
  }, [initialSession]);

  // Calculer le pourcentage de progression
  const progressPercent = session?.total_minutes && localRemainingMinutes !== null
    ? Math.round(((session.total_minutes - localRemainingMinutes) / session.total_minutes) * 100)
    : 0;

  // Calculer le temps utilisé
  const usedMinutes = session?.total_minutes && localRemainingMinutes !== null
    ? session.total_minutes - localRemainingMinutes
    : 0;

  // Ne marquer comme expiré QUE si remaining = 0 ET la session est active depuis au moins 1 minute
  const hasStarted = session && session.started_at && 
    (new Date() - new Date(session.started_at)) > 60000; // 1 minute
  const isExpired = localRemainingMinutes !== null && localRemainingMinutes === 0 && hasStarted;
  
  return {
    session,
    remainingMinutes: localRemainingMinutes ?? 0,
    remainingSeconds: localSeconds,
    usedMinutes,
    progressPercent,
    totalMinutes: session?.total_minutes || 0,
    isLowTime: localRemainingMinutes !== null && localRemainingMinutes <= 5 && localRemainingMinutes > 0,
    isExpired
  };
}
