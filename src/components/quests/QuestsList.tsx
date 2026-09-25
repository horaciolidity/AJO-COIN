import React from 'react';
import { useGame } from '../../context/GameContext';
import { Scroll, CheckCircle2, Gift, Sparkles } from 'lucide-react';

export const QuestsList: React.FC = () => {
  const { quests, claimQuestReward } = useGame();

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto min-h-[calc(100vh-140px)] pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <span>📜</span> DAILY & LIFETIME QUESTS
        </h2>
        <p className="text-xs text-gray-400">Complete farming tasks to earn bonus GC coins & AJO tokens</p>
      </div>

      <div className="space-y-3">
        {quests.map((q) => {
          const progressPct = Math.min(100, Math.floor((q.progress / q.targetValue) * 100));

          return (
            <div
              key={q.id}
              className={`glass-panel p-4 rounded-2xl border transition-all space-y-2.5 ${
                q.isCompleted && !q.isClaimed
                  ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                  : 'border-purple-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-xl">
                    {q.questType === 'TAPS' ? '🔥' : q.questType === 'HARVEST' ? '🧄' : q.questType === 'BOX' ? '📦' : q.questType === 'REFERRAL' ? '👥' : '👛'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{q.title}</h4>
                    <p className="text-[11px] text-gray-300">{q.description}</p>
                  </div>
                </div>

                {/* Claim Button or Status */}
                {q.isClaimed ? (
                  <span className="text-xs text-gray-400 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Claimed
                  </span>
                ) : q.isCompleted ? (
                  <button
                    onClick={() => claimQuestReward(q.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sprout-500 to-emerald-600 text-white font-extrabold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1 animate-pulse"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    CLAIM
                  </button>
                ) : (
                  <span className="text-xs font-bold text-gray-400">
                    {q.progress} / {q.targetValue}
                  </span>
                )}
              </div>

              {/* Progress bar & reward info */}
              <div className="space-y-1">
                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-sprout-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    Reward: +{q.rewardGc.toLocaleString()} GC {q.rewardAjo > 0 && `+ ${q.rewardAjo} AJO`}
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
