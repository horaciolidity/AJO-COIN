import React from 'react';
import { useGame } from '../../context/GameContext';
import { MissionDifficulty } from '../../types';
import { CheckCircle2, Gift, Sparkles, Star } from 'lucide-react';
import { DailyMissions } from './DailyMissions';

const DIFFICULTY_BADGES: Record<MissionDifficulty, { label: string; bg: string; text: string; border: string }> = {
  EASY: { label: '🟢 EASY', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  NORMAL: { label: '🟡 NORMAL', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  HARD: { label: '🔴 HARD', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  HELL: { label: '☠️ HELL', bg: 'bg-purple-950/60', text: 'text-purple-300 font-black animate-pulse', border: 'border-purple-500/60' },
};

export const QuestsList: React.FC = () => {
  const { quests, claimQuestReward } = useGame();

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto min-h-[calc(100vh-140px)] pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          <span>📜</span> MISIONES & DESAFÍOS
        </h2>
        <p className="text-xs text-gray-300">Completa objetivos para ganar XP y Dientes de Ajo 🧄</p>
      </div>

      {/* Daily Missions Panel */}
      <DailyMissions />

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">MISIONES PERMANENTES</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <div className="space-y-3">
        {quests.map((q) => {
          const progressPct = Math.min(100, Math.floor((q.progress / q.targetValue) * 100));
          const diffInfo = DIFFICULTY_BADGES[q.difficulty || 'NORMAL'];
          const teethReward = q.rewardGarlicTeeth || 15;
          const xpReward = q.rewardXp || 100;

          const isReadyToClaim = (q.isCompleted || q.progress >= q.targetValue) && !q.isClaimed;

          return (
            <div
              key={q.id}
              className={`glass-panel p-4 rounded-2xl border transition-all space-y-2.5 ${
                isReadyToClaim
                  ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-500/10 scale-[1.01]'
                  : 'border-purple-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-xl shrink-0 mt-0.5">
                    {q.questType === 'TAPS' ? '🔥' : q.questType === 'HARVEST' ? '🧄' : q.questType === 'BOX' ? '📦' : q.questType === 'REFERRAL' ? '👥' : '👛'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white">{q.title}</h4>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase ${diffInfo.bg} ${diffInfo.text} ${diffInfo.border}`}>
                        {diffInfo.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-tight mt-0.5">{q.description}</p>
                  </div>
                </div>

                {/* Claim Button or Status */}
                {q.isClaimed ? (
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Reclamado
                  </span>
                ) : isReadyToClaim ? (
                  <button
                    onClick={() => claimQuestReward(q.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sprout-500 to-emerald-600 text-white font-extrabold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1 animate-pulse shrink-0"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    RECLAMAR
                  </button>
                ) : (
                  <span className="text-xs font-bold text-gray-400 shrink-0">
                    {q.progress} / {q.targetValue}
                  </span>
                )}
              </div>

              {/* Progress bar & reward info */}
              <div className="space-y-1 pt-1">
                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-sprout-500 via-emerald-400 to-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-amber-300 font-bold flex items-center gap-2">
                    <span className="flex items-center gap-0.5">🧄 +{teethReward} Teeth</span>
                    <span className="flex items-center gap-0.5 text-purple-300">
                      <Star className="w-3 h-3 text-purple-400 fill-purple-400" /> +{xpReward} XP
                    </span>
                  </span>
                  <span className="text-gray-400 font-medium">{progressPct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
