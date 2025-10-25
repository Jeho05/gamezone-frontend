import React, { useEffect, useRef, useState } from 'react';

export default function VideoBackground({ 
  videoSrc, 
  overlay = true, 
  overlayOpacity = 0.7,
  children,
  className = ''
}) {
  const videoRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false); // Start with false
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const smallScreen = window.matchMedia('(max-width: 640px)');
      const update = () => {
        setShowVideo(!(reduceMotion.matches || smallScreen.matches));
      };
      update();
      reduceMotion.addEventListener('change', update);
      smallScreen.addEventListener('change', update);
      return () => {
        reduceMotion.removeEventListener('change', update);
        smallScreen.removeEventListener('change', update);
      };
    } catch (err) {
      console.error('VideoBackground setup error:', err);
      setError(true);
    }
  }, []);

  useEffect(() => {
    try {
      if (showVideo && videoRef.current) {
        videoRef.current.playbackRate = 0.75;
      }
    } catch (err) {
      console.error('Video playback error:', err);
    }
  }, [showVideo]);

  return (
    <div className={`relative ${className}`}>
      {/* Decorative Background Layer (clipped) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900" />
        
        {/* Video Background */}
        {showVideo && !error && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute top-0 left-0 w-full h-full object-cover"
            onError={() => {
              console.warn('Video failed to load, using fallback');
              setError(true);
            }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}

        {/* Gradient Overlay */}
        {overlay && (
          <div 
            className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-pink-900/80 to-blue-900/90"
            style={{ opacity: overlayOpacity }}
          />
        )}

        {/* Animated Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-transparent to-pink-500/20 animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
