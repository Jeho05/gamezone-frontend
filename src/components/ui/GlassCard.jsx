import React from 'react';

export default function GlassCard({ 
  children, 
  className = '', 
  hover = true,
  gradient = true 
}) {
  return (
    <div 
      className={`
        relative overflow-visible rounded-2xl
        backdrop-blur-xl bg-white/10 
        border border-white/20
        shadow-2xl shadow-purple-500/20
        ${hover ? 'transition-all duration-300 hover:scale-[1.03] hover:shadow-purple-500/40 hover:bg-white/15' : ''}
        ${gradient ? 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/10 before:to-pink-500/10 before:pointer-events-none' : ''}
        ${className}
      `}
    >
      {/* Shine effect on hover */}
      {hover && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
