import React, { useEffect, useMemo, useState } from 'react';

export default function ParallaxObject({ 
  src, 
  alt, 
  size = 100, 
  speed = 0.5,
  position = { x: 50, y: 50 },
  rotate = false 
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false); // Start disabled

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const smallScreen = window.matchMedia('(max-width: 640px)');
      const update = () => setEnabled(!(reduceMotion.matches || smallScreen.matches));
      update();
      reduceMotion.addEventListener('change', update);
      smallScreen.addEventListener('change', update);
      return () => {
        reduceMotion.removeEventListener('change', update);
        smallScreen.removeEventListener('change', update);
      };
    } catch (err) {
      console.error('ParallaxObject setup error:', err);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let rafId;
    try {
      const handleMouseMove = (e) => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const x = (e.clientX - window.innerWidth / 2) * speed * 0.01;
          const y = (e.clientY - window.innerHeight / 2) * speed * 0.01;
          setOffset({ x, y });
        });
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(rafId);
      };
    } catch (err) {
      console.error('ParallaxObject mouse tracking error:', err);
    }
  }, [speed, enabled]);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: enabled
          ? `translate(${offset.x}px, ${offset.y}px) ${rotate ? 'rotate(' + offset.x + 'deg)' : ''}`
          : 'none',
        transition: enabled ? 'transform 0.3s ease-out' : 'none',
      }}
    >
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-contain opacity-60"
        style={{
          filter: enabled
            ? 'drop-shadow(0 0 28px rgba(168, 85, 247, 0.7)) drop-shadow(0 0 14px rgba(236, 72, 153, 0.5))'
            : 'none',
        }}
        onError={(e) => {
          console.warn(`Failed to load image: ${src}`);
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
}
