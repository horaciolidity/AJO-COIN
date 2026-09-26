import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Zap } from 'lucide-react';

interface RhythmBarProps {
  isActive: boolean;
  onPerfectHit: () => void;
  onMissedHit: () => void;
}

type HitFeedback = 'PERFECT' | 'GOOD' | 'MISS' | null;

/**
 * RhythmBar — A moving indicator that bounces left-right.
 * Tapping the garlic while the bar is in the "PERFECT ZONE" (center)
 * grants a bonus XP multiplier.
 */
export const RhythmBar: React.FC<RhythmBarProps> = ({ isActive, onPerfectHit, onMissedHit }) => {
  const [position, setPosition] = useState(50); // 0-100% across the bar
  const [direction, setDirection] = useState(1);
  const [hitFeedback, setHitFeedback] = useState<HitFeedback>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const speed = 60; // % per second

  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    setPosition((prev) => {
      let next = prev + direction * speed * delta;
      if (next >= 100) {
        next = 100;
        setDirection(-1);
      } else if (next <= 0) {
        next = 0;
        setDirection(1);
      }
      return next;
    });

    animFrameRef.current = requestAnimationFrame(animate);
  }, [direction, speed]);

  useEffect(() => {
    if (isActive) {
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, animate]);

  const checkHit = useCallback(() => {
    // Perfect zone: center 20% of bar (40-60%)
    // Good zone: 30-40% or 60-70%
    const PERFECT_MIN = 38;
    const PERFECT_MAX = 62;
    const GOOD_MIN = 28;
    const GOOD_MAX = 72;

    if (position >= PERFECT_MIN && position <= PERFECT_MAX) {
      setHitFeedback('PERFECT');
      onPerfectHit();
    } else if (position >= GOOD_MIN && position <= GOOD_MAX) {
      setHitFeedback('GOOD');
    } else {
      setHitFeedback('MISS');
      onMissedHit();
    }

    setTimeout(() => setHitFeedback(null), 500);
  }, [position, onPerfectHit, onMissedHit]);

  // Expose checkHit via ref — parent calls this on tap
  useEffect(() => {
    (window as any).__rhythmBarCheckHit = checkHit;
    return () => {
      delete (window as any).__rhythmBarCheckHit;
    };
  }, [checkHit]);

  if (!isActive) return null;

  return (
    <div className="w-full space-y-1">
      {/* Feedback label */}
      <div className="h-5 flex items-center justify-center">
        {hitFeedback === 'PERFECT' && (
          <span className="text-xs font-black text-yellow-300 animate-ping-once tracking-widest flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
            PERFECT! +2x XP
          </span>
        )}
        {hitFeedback === 'GOOD' && (
          <span className="text-xs font-bold text-emerald-400 tracking-wider">GOOD! +1.5x XP</span>
        )}
        {hitFeedback === 'MISS' && (
          <span className="text-xs font-bold text-red-400 tracking-wider">MISS... ×1 XP</span>
        )}
      </div>

      {/* Rhythm track */}
      <div className="relative w-full h-8 bg-black/50 rounded-full border border-white/10 overflow-hidden shadow-inner">
        {/* Perfect zone highlight */}
        <div
          className="absolute top-0 h-full bg-yellow-400/20 border-x border-yellow-400/40"
          style={{ left: '38%', width: '24%' }}
        />

        {/* Good zone tint */}
        <div
          className="absolute top-0 h-full bg-emerald-400/10"
          style={{ left: '28%', width: '10%' }}
        />
        <div
          className="absolute top-0 h-full bg-emerald-400/10"
          style={{ left: '62%', width: '10%' }}
        />

        {/* Moving indicator */}
        <div
          className="absolute top-1 bottom-1 w-3 rounded-full bg-gradient-to-b from-white via-yellow-300 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] transition-none"
          style={{ left: `calc(${position}% - 6px)` }}
        />

        {/* Center zone label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[9px] font-black text-yellow-300/50 uppercase tracking-widest">PERFECT ZONE</span>
        </div>
      </div>

      <p className="text-center text-[9px] text-gray-400 font-medium uppercase tracking-wider">
        ¡Toca cuando el indicador esté en la ZONA PERFECTA!
      </p>
    </div>
  );
};
