import React from 'react';

export default function NeonText({ 
  children, 
  color = 'purple', 
  glow = true,
  className = '',
  as = 'h1'
}) {
  const colors = {
    purple: 'text-purple-400',
    pink: 'text-pink-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    cyan: 'text-cyan-400',
  };

  const glows = {
    purple: 'drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]',
    pink: 'drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]',
    blue: 'drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]',
    green: 'drop-shadow-[0_0_15px_rgba(34,197,94,0.8)] drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]',
    yellow: 'drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]',
    red: 'drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]',
    cyan: 'drop-shadow-[0_0_15px_rgba(87,191,225,0.8)] drop-shadow-[0_0_30px_rgba(87,191,225,0.5)]',
  };

  const Tag = as;

  return (
    <Tag 
      className={`
        ${colors[color]} 
        ${glow ? glows[color] : ''} 
        font-bold 
        tracking-wider
        ${className}
      `}
    >
      {children}
    </Tag>
  );
}
