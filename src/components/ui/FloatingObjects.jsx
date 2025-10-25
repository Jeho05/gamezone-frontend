import React from 'react';

const objects = [
  { src: '/images/objet/Console-PNG-Clipart.png', alt: 'Console', size: 160, speed: 15 },
  { src: '/images/objet/Dragon-Ball-Z-Logo-PNG-HD.png', alt: 'Dragon Ball', size: 120, speed: 20 },
  { src: '/images/objet/Goku-Blue-PNG-Photo.png', alt: 'Goku', size: 200, speed: 25 },
  { src: '/images/objet/FIFA-Logo-PNG-Isolated-Image.png', alt: 'FIFA', size: 140, speed: 18 },
  { src: '/images/objet/Akatsuki-Transparent-Background.png', alt: 'Akatsuki', size: 180, speed: 22 },
  { src: '/images/objet/Kratos-PNG-Clipart.png', alt: 'Kratos', size: 170, speed: 19 },
  { src: '/images/objet/Console-Transparent-Background.png', alt: 'Controller', size: 130, speed: 17 },
  { src: '/images/objet/—Pngtree—retro neon video game controller_17879972.png', alt: 'Neon Controller', size: 190, speed: 23 },
];

export default function FloatingObjects({ count = 6, opacity = 0.15 }) {
  const selectedObjects = objects.slice(0, count);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
      {selectedObjects.map((obj, index) => (
        <div
          key={index}
          className="absolute animate-float"
          style={{
            left: `${Math.random() * 90}%`,
            top: `${Math.random() * 90}%`,
            animationDelay: `${index * 2}s`,
            animationDuration: `${obj.speed}s`,
            opacity: opacity,
            filter: 'drop-shadow(0 0 50px rgba(168, 85, 247, 1)) drop-shadow(0 0 30px rgba(236, 72, 153, 0.8)) brightness(1.3)',
          }}
        >
          <img
            src={obj.src}
            alt={obj.alt}
            width={obj.size}
            height={obj.size}
            className="object-contain animate-pulse-slow"
            style={{
              animationDelay: `${index * 1.5}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
