import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import {
  RefreshCw, Gift, CheckCircle2, Clock, ExternalLink,
  Youtube, Send, Twitter, Instagram, Sparkles,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export interface SocialTask {
  id: string;
  platform: 'YOUTUBE' | 'TELEGRAM' | 'X' | 'INSTAGRAM' | 'WEB';
  title: string;
  description: string;
  url: string;
  rewardGc: number;
  rewardTeeth: number;
  rewardAjo: number;
}

const DEFAULT_SOCIAL_TASKS: SocialTask[] = [
  {
    id: 'st_yt_1',
    platform: 'YOUTUBE',
    title: 'SUSCRÍBETE EN YOUTUBE',
    description: 'Sigue el canal oficial de YouTube de AJO COIN',
    url: 'https://youtube.com/@AjoCoinOfficial',
    rewardGc: 500,
    rewardTeeth: 50,
    rewardAjo: 1.0,
  },
  {
    id: 'st_tg_1',
    platform: 'TELEGRAM',
    title: 'ÚNETE AL CANAL DE TELEGRAM',
    description: 'Entra al grupo oficial de anuncios y airdrops en TG',
    url: 'https://t.me/AjoCoinCommunity',
    rewardGc: 500,
    rewardTeeth: 50,
    rewardAjo: 1.0,
  },
  {
    id: 'st_x_1',
    platform: 'X',
    title: 'SIGUE A AJO COIN EN X (TWITTER)',
    description: 'Sé el primero en ver las actualizaciones de tokens en X',
    url: 'https://x.com/AjoCoinCrypto',
    rewardGc: 500,
    rewardTeeth: 50,
    rewardAjo: 1.0,
  },
  {
    id: 'st_ig_1',
    platform: 'INSTAGRAM',
    title: 'SIGUE A AJO COIN EN INSTAGRAM',
    description: 'Entérate de sorteos y noticias en Instagram',
    url: 'https://instagram.com/AjoCoinApp',
    rewardGc: 500,
    rewardTeeth: 50,
    rewardAjo: 1.0,
  },
];

// ALL daily mission templates (3 randomly chosen per day using date seed)
const DAILY_TEMPLATES = [
  { code: 'DAILY_TAPS_50',    title: '50 TAPS HOY',         description: 'Toca el ajo 50 veces hoy',                    targetValue: 50,   rewardGarlicTeeth: 20,  rewardXp: 150,  rewardGc: 200,  icon: '🔥', metric: 'taps',    difficulty: 'EASY' as const },
  { code: 'DAILY_TAPS_200',   title: '200 TAPS HOY',        description: 'Toca el ajo 200 veces en el día',             targetValue: 200,  rewardGarlicTeeth: 60,  rewardXp: 400,  rewardGc: 600,  icon: '💪', metric: 'taps',    difficulty: 'NORMAL' as const },
  { code: 'DAILY_TAPS_500',   title: '500 TAPS HOY',        description: '¡Toca el ajo 500 veces!',                     targetValue: 500,  rewardGarlicTeeth: 120, rewardXp: 800,  rewardGc: 1200, icon: '⚡', metric: 'taps',    difficulty: 'HARD' as const },
  { code: 'DAILY_HARVEST_10', title: 'COSECHA x10',         description: 'Cosecha 10 ajos hoy',                         targetValue: 10,   rewardGarlicTeeth: 30,  rewardXp: 200,  rewardGc: 350,  icon: '🧄', metric: 'harvest', difficulty: 'EASY' as const },
  { code: 'DAILY_HARVEST_30', title: 'COSECHA x30',         description: 'Cosecha 30 ajos en el día',                   targetValue: 30,   rewardGarlicTeeth: 80,  rewardXp: 500,  rewardGc: 800,  icon: '🌾', metric: 'harvest', difficulty: 'HARD' as const },
  { code: 'DAILY_HARVEST_60', title: 'COSECHA MASIVA x60',  description: '¡Cosecha 60 ajos en un solo día!',            targetValue: 60,   rewardGarlicTeeth: 150, rewardXp: 900,  rewardGc: 1500, icon: '🏆', metric: 'harvest', difficulty: 'HELL' as const },
  { code: 'DAILY_COMBO_20',   title: 'COMBO x20',           description: 'Alcanza un combo de 20+ taps sin parar',      targetValue: 20,   rewardGarlicTeeth: 40,  rewardXp: 300,  rewardGc: 400,  icon: '⚡', metric: 'combo',   difficulty: 'NORMAL' as const },
  { code: 'DAILY_COMBO_50',   title: 'FRENZY x50',          description: '¡Llega a un combo de 50 taps seguidos!',      targetValue: 50,   rewardGarlicTeeth: 120, rewardXp: 800,  rewardGc: 1200, icon: '🌪️', metric: 'combo',  difficulty: 'HELL' as const },
  { code: 'DAILY_COMBO_30',   title: 'FURIA AJERA x30',     description: 'Mantén 30 taps seguidos sin perder el combo', targetValue: 30,   rewardGarlicTeeth: 70,  rewardXp: 500,  rewardGc: 700,  icon: '🌩️', metric: 'combo',  difficulty: 'HARD' as const },
];

const DIFFICULTY_STYLES = {
  EASY:   { label: '🟢 EASY',   bg: 'bg-emerald-500/10', text: 'text-emerald-400',                          border: 'border-emerald-500/30' },
  NORMAL: { label: '🟡 NORMAL', bg: 'bg-yellow-500/10',  text: 'text-yellow-400',                           border: 'border-yellow-500/30' },
  HARD:   { label: '🔴 HARD',   bg: 'bg-rose-500/10',    text: 'text-rose-400',                             border: 'border-rose-500/30' },
  HELL:   { label: '☠️ HELL',   bg: 'bg-purple-950/60',  text: 'text-purple-300 font-black animate-pulse',  border: 'border-purple-500/60' },
};

// Deterministic date-seeded shuffle → same 3 missions per day for all players
function getSeededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDailyMissions() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const shuffled = [...DAILY_TEMPLATES].sort((a, b) => {
    const ia = DAILY_TEMPLATES.indexOf(a);
    const ib = DAILY_TEMPLATES.indexOf(b);
    return getSeededRandom(seed + ia) - getSeededRandom(seed + ib);
  });
  return shuffled.slice(0, 3);
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}

// ─── Claim state key ─────────────────────────────────────────────────────────
const DAILY_CLAIM_KEY = 'ajo_daily_missions_claimed_v2';
function loadDailyClaims(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(DAILY_CLAIM_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    // Purge entries from old days
    const today = getTodayKey();
    const filtered: Record<string, boolean> = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (k.startsWith(today)) filtered[k] = v as boolean;
    });
    return filtered;
  } catch (_) { return {}; }
}

export const DailyMissions: React.FC = () => {
  const gameCtx = useGame();
  const { dailyData, showToast } = gameCtx;

  const missions  = useMemo(() => getDailyMissions(), []);
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

  // Social tasks
  const [socialTasks, setSocialTasks] = useState<SocialTask[]>(() => {
    const saved = localStorage.getItem('ajo_custom_social_tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_SOCIAL_TASKS;
  });

  const [claimedSocial, setClaimedSocial] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('ajo_claimed_social_tasks');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return {};
  });
  const [visitedTasks, setVisitedTasks] = useState<Record<string, boolean>>({});

  // Daily mission claims (keyed by `${today}_${code}`)
  const [dailyClaimed, setDailyClaimed] = useState<Record<string, boolean>>(loadDailyClaims);

  // Refresh social tasks from storage (e.g. set by admin panel)
  useEffect(() => {
    const checkTasks = () => {
      const saved = localStorage.getItem('ajo_custom_social_tasks');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setSocialTasks(parsed);
        } catch (e) {}
      }
    };
    window.addEventListener('storage', checkTasks);
    return () => window.removeEventListener('storage', checkTasks);
  }, []);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getTimeUntilMidnight()), 60_000);
    return () => clearInterval(t);
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const getMissionProgress = (metric: string, targetValue: number): number => {
    if (!dailyData) return 0;
    switch (metric) {
      case 'taps':    return Math.min(targetValue, dailyData.taps    ?? 0);
      case 'harvest': return Math.min(targetValue, dailyData.harvest ?? 0);
      case 'combo':   return Math.min(targetValue, dailyData.combo   ?? 0);
      default:        return 0;
    }
  };

  const handleClaimDaily = (m: typeof missions[number]) => {
    const key = `${getTodayKey()}_${m.code}`;
    if (dailyClaimed[key]) return;
    triggerHaptic('success');
    const next = { ...dailyClaimed, [key]: true };
    setDailyClaimed(next);
    localStorage.setItem(DAILY_CLAIM_KEY, JSON.stringify(next));

    // Grant rewards via inventory state
    gameCtx.showToast(
      '🎁 ¡Misión Diaria Reclamada!',
      `+${m.rewardGc} GC  •  +${m.rewardGarlicTeeth} 🦷  •  +${m.rewardXp} XP`,
      'success',
    );
    // Directly update inventory via localStorage bridge (context doesn't expose setInventory)
    // We piggyback on claimQuestReward by marking it - but here we patch inventory through
    // the StorageAdapter save mechanism by dispatching a custom event.
    window.dispatchEvent(new CustomEvent('AJO_DAILY_REWARD', {
      detail: { gc: m.rewardGc, teeth: m.rewardGarlicTeeth, xp: m.rewardXp },
    }));
  };

  const handleVisitLink = (taskId: string, url: string) => {
    triggerHaptic('medium');
    setVisitedTasks((prev) => ({ ...prev, [taskId]: true }));
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openLink) tg.openLink(url); else window.open(url, '_blank');
    showToast('Enlace Abierto 📲', 'Regresa al juego para reclamar tu premio.', 'info');
  };

  const handleClaimSocial = (task: SocialTask) => {
    triggerHaptic('success');
    const next = { ...claimedSocial, [task.id]: true };
    setClaimedSocial(next);
    localStorage.setItem('ajo_claimed_social_tasks', JSON.stringify(next));
    showToast('🎉 ¡Misión Social Reclamada!', `+${task.rewardGc} GC  •  +${task.rewardTeeth} 🦷  •  +${task.rewardAjo} AJO`, 'success');
  };

  const renderPlatformIcon = (platform: SocialTask['platform']) => {
    switch (platform) {
      case 'YOUTUBE':   return <Youtube   className="w-5 h-5 text-red-500" />;
      case 'TELEGRAM':  return <Send      className="w-5 h-5 text-sky-400" />;
      case 'X':         return <Twitter   className="w-5 h-5 text-white" />;
      case 'INSTAGRAM': return <Instagram className="w-5 h-5 text-pink-400" />;
      default:          return <ExternalLink className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Social Tasks ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-amber-300 uppercase tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> TAREAS SOCIALES &amp; SUSCRIPCIONES
          </h3>
          <span className="text-[9px] bg-amber-400/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-400/30">
            PREMIOS EXTRAS 🎁
          </span>
        </div>

        <div className="space-y-2">
          {socialTasks.map((t) => {
            const isClaimed = claimedSocial[t.id];
            const isVisited = visitedTasks[t.id];
            return (
              <div
                key={t.id}
                className={`glass-panel p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isClaimed
                    ? 'border-emerald-500/30 bg-emerald-950/20 opacity-75'
                    : 'border-amber-500/30 bg-gradient-to-r from-purple-950/40 via-amber-950/10 to-black/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center shrink-0 shadow">
                    {renderPlatformIcon(t.platform)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-white truncate">{t.title}</h4>
                    <p className="text-[10px] text-gray-300 truncate">{t.description}</p>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-amber-300 mt-0.5">
                      <span>+{t.rewardGc} GC</span>
                      <span>+{t.rewardTeeth} 🦷</span>
                      <span>+{t.rewardAjo} AJO</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isClaimed ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reclamado
                    </span>
                  ) : isVisited ? (
                    <button
                      onClick={() => handleClaimSocial(t)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 animate-bounce"
                    >
                      <Gift className="w-3.5 h-3.5" /> RECLAMAR
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVisitLink(t.id, t.url)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> IR A MISIÓN
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Daily Game Missions ───────────────────────────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
            <span>📅</span> MISIONES DIARIAS
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-black/40 px-2 py-1 rounded-full border border-white/10">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Resetea en <span className="text-amber-300 font-bold">{timeLeft}</span></span>
          </div>
        </div>

        {missions.map((m) => {
          const progress    = getMissionProgress(m.metric, m.targetValue);
          const progressPct = Math.min(100, Math.floor((progress / m.targetValue) * 100));
          const isCompleted = progressPct >= 100;
          const claimKey    = `${getTodayKey()}_${m.code}`;
          const isClaimed   = dailyClaimed[claimKey];
          const diff        = DIFFICULTY_STYLES[m.difficulty];

          return (
            <div
              key={m.code}
              className={`glass-panel p-3.5 rounded-2xl border transition-all space-y-2 ${
                isClaimed
                  ? 'border-gray-600/30 opacity-60'
                  : isCompleted
                  ? 'border-amber-500/60 bg-amber-950/20 shadow-lg shadow-amber-500/10'
                  : 'border-purple-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xl shrink-0">
                    {m.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-xs text-white">{m.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase ${diff.bg} ${diff.text} ${diff.border}`}>
                        {diff.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-300 mt-0.5">{m.description}</p>
                  </div>
                </div>

                {/* Action / Status */}
                {isClaimed ? (
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Reclamado
                  </span>
                ) : isCompleted ? (
                  <button
                    onClick={() => handleClaimDaily(m)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 animate-bounce shrink-0"
                  >
                    <Gift className="w-3.5 h-3.5" /> RECLAMAR
                  </button>
                ) : (
                  <span className="text-xs font-bold text-gray-400 shrink-0 mt-1">
                    {progress}/{m.targetValue}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isClaimed
                      ? 'bg-gray-500'
                      : isCompleted
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Rewards row */}
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                <span className="text-amber-300 font-bold">🦷 +{m.rewardGarlicTeeth}</span>
                <span className="text-purple-300 font-bold">⭐ +{m.rewardXp} XP</span>
                <span className="text-emerald-300 font-bold">💰 +{m.rewardGc} GC</span>
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
          <RefreshCw className="w-3 h-3" />
          <span>Las misiones diarias se renuevan a medianoche automáticamente</span>
        </div>
      </div>
    </div>
  );
};
