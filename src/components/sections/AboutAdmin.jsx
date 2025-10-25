'use client';
import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import NeonText from '@/components/ui/NeonText';
import VideoBackground from '@/components/ui/VideoBackground';
import { Sparkles, Award, Users, GamepadIcon, Trophy, Star } from 'lucide-react';

const adminPhotos = [
  {
    src: '/images/gaming tof/Boss/ismo_PDG.jpg',
    title: 'PDG & Fondateur',
    description: 'Visionnaire de l\'expérience gaming'
  },
  {
    src: '/images/gaming tof/Boss/ismo_Pro.jpg',
    title: 'Expert Gaming',
    description: 'Passionné de technologie'
  },
  {
    src: '/images/gaming tof/Boss/ismo_décontracté_pro.jpg',
    title: 'Leader Innovant',
    description: 'Créateur d\'expériences uniques'
  },
  {
    src: '/images/gaming tof/Boss/ismo_pro1.jpg',
    title: 'Entrepreneur',
    description: 'Architecte de la communauté gaming'
  },
];

const stats = [
  { icon: GamepadIcon, value: '500+', label: 'Jeux Disponibles', color: 'text-purple-400' },
  { icon: Users, value: '10K+', label: 'Joueurs Actifs', color: 'text-pink-400' },
  { icon: Trophy, value: '50K+', label: 'Sessions Jouées', color: 'text-blue-400' },
  { icon: Star, value: '4.9/5', label: 'Satisfaction', color: 'text-yellow-400' },
];

export default function AboutAdmin() {
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  return (
    <section className="relative py-32 overflow-x-hidden bg-black">
      <VideoBackground 
        videoSrc="/images/video/Arcade_Welcome_Manager_Loop.mp4"
        overlayOpacity={0.9}
        className="bg-black"
      >

      <div className="container mx-auto px-6 md:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 animate-slide-in-up">
          <div className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            <span className="text-purple-400 font-semibold tracking-widest uppercase text-sm">Notre Vision</span>
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <NeonText color="purple" className="text-5xl md:text-6xl mb-8">
            Rencontrez le Fondateur
          </NeonText>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            Une passion pour le gaming, une vision pour créer la meilleure expérience de jeu en arcade
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start mb-24">
          {/* Photo Gallery */}
          <div className="space-y-6 animate-slide-in-right">
            <div className="bg-black/70 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-6 md:p-10 shadow-2xl">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-8">
                <img
                  src={adminPhotos[selectedPhoto].src}
                  alt={adminPhotos[selectedPhoto].title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{adminPhotos[selectedPhoto].title}</h3>
                  <p className="text-gray-200 drop-shadow-lg">{adminPhotos[selectedPhoto].description}</p>
                </div>
              </div>

              {/* Photo Thumbnails */}
              <div className="grid grid-cols-4 gap-3 md:gap-6">
                {adminPhotos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhoto(index)}
                    className={`
                      relative aspect-square rounded-lg overflow-hidden
                      transition-all duration-300
                      ${selectedPhoto === index 
                        ? 'ring-4 ring-purple-500 scale-105' 
                        : 'ring-2 ring-white/20 hover:ring-purple-400 opacity-60 hover:opacity-100'
                      }
                    `}
                  >
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* About Content */}
          <div className="space-y-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-black/70 backdrop-blur-xl border-2 border-pink-500/30 rounded-2xl p-6 md:p-10 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <Award className="w-10 h-10 text-yellow-400 animate-bounce-soft" />
                <h3 className="text-3xl font-bold gradient-text">ISMO - Fondateur</h3>
              </div>
              
              <div className="space-y-6 text-gray-300">
                <p className="text-lg leading-relaxed">
                  Avec plus de <span className="text-purple-400 font-bold">10 ans d'expérience</span> dans l'industrie du gaming,
                  ISMO a transformé sa passion en une <span className="text-pink-400 font-bold">vision révolutionnaire</span> :
                  créer l'arcade gaming ultime où technologie et divertissement se rencontrent.
                </p>
                
                <p className="leading-relaxed">
                  Notre mission est simple : offrir à chaque joueur une expérience <span className="text-blue-400 font-bold">immersive</span>,
                  <span className="text-green-400 font-bold"> compétitive</span> et <span className="text-yellow-400 font-bold">inoubliable</span>.
                  Des dernières consoles aux PC gaming haut de gamme, nous investissons constamment dans la meilleure technologie.
                </p>

                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-6 md:p-8 my-6 md:my-8 border border-purple-500/30">
                  <p className="italic text-white font-medium text-center text-lg">
                    "Le gaming n'est pas qu'un passe-temps, c'est une passion, une communauté, un style de vie. 
                    Notre objectif est de créer un espace où chaque joueur se sent chez lui."
                  </p>
                  <p className="text-right text-purple-300 mt-3">— ISMO</p>
                </div>

                <p className="leading-relaxed">
                  Rejoignez notre communauté grandissante et découvrez pourquoi nous sommes l'arcade gaming 
                  <span className="text-purple-400 font-bold"> #1 de la région</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          {stats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl p-4 md:p-6 text-center hover-lift shadow-2xl transition-all duration-300 hover:scale-105 hover:border-purple-400">
              <stat.icon className={`w-12 h-12 mx-auto mb-4 ${stat.color} animate-glow-pulse`} />
              <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
              <div className="text-gray-200 text-sm font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      </VideoBackground>
    </section>
  );
}
