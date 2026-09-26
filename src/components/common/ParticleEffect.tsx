import React, { useEffect, useRef } from 'react';
import { registerParticleCanvas } from '../../utils/particleSystem';

export const ParticleEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      registerParticleCanvas(canvas);
    }
    return () => {
      registerParticleCanvas(null);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    />
  );
};
