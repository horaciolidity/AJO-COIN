import React from 'react';
import { useGame } from '../../context/GameContext';

export const ParticleEffect: React.FC = () => {
  const { floatingParticles } = useGame();

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {floatingParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute font-black text-2xl text-sprout-400 text-glow-green animate-float-up drop-shadow-lg"
          style={{ left: `${particle.x - 15}px`, top: `${particle.y - 20}px` }}
        >
          {particle.text}
        </div>
      ))}
    </div>
  );
};
