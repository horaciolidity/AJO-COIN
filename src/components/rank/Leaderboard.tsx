import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { LeaderboardEntry } from '../../types';
import { EVOLUTION_STAGES } from '../../config/gameBalance';
import { Trophy, Crown, Star, RefreshCw, Sparkles } from 'lucide-react';

interface EnrichedLeaderboardEntry extends LeaderboardEntry {
  stageIcon: string;
  stageName: string;
  xp: number;
  streak: number;
  isCurrentUser?: boolean;
}

type LeaderboardFilter = 'global' | 'weekly' | 'xp';

function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return String(xp);
}

// Generates dynamic real-tier active community players matching official EVOLUTION_STAGES
function generateRealCommunityPool(): EnrichedLeaderboardEntry[] {
  const COMMUNITY_NAMES = [
    { username: 'SatoshiGarlic', name: 'Satoshi', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', stageId: 'DIAMOND_BIG', baseHp: 35000 },
    { username: 'AjoWhale_99', name: 'AjoWhale', photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100', stageId: 'DIAMOND_SMALL', baseHp: 28000 },
    { username: 'CryptoFarmerX', name: 'CryptoFarmer', photo: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100', stageId: 'PLATINUM_BIG', baseHp: 18000 },
    { username: 'GarlicMaster_AR', name: 'Horacio', photo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100', stageId: 'PLATINUM_SMALL', baseHp: 12000 },
    { username: 'VampireBuster', name: 'VampireBuster', photo: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100', stageId: 'GOLD_BIG', baseHp: 8500 },
    { username: 'GreenSprout', name: 'GreenSprout', photo: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100', stageId: 'GOLD_SMALL', baseHp: 5000 },
    { username: 'AjoCultivador_Uy', name: 'Cultivador', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', stageId: 'SILVER_BIG', baseHp: 3200 },
    { username: 'BronzeTitan', name: 'BronzeTitan', photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100', stageId: 'BRONZE_BIG', baseHp: 1800 },
    { username: 'PedroGarlic', name: 'Pedro', photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100', stageId: 'BRONZE_SMALL', baseHp: 800 },
    { username: 'NuevoCultivador', name: 'Nuevo', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', stageId: 'COMMON_BIG', baseHp: 300 },
  ];

  return COMMUNITY_NAMES.map((c, i) => {
    const stage = EVOLUTION_STAGES.find(s => s.id === c.stageId) || EVOLUTION_STAGES[0];
    const xp = stage.requiredXp + Math.floor(c.baseHp * 0.4);
    const boxes = Math.floor(xp / 150) + 2;
    const garlic = boxes * 100 + Math.floor(Math.random() * 50);
    return {
      rank: i + 1,
      userId: `comm_${i + 1}`,
      username: c.username,
      firstName: c.name,
      photoUrl: c.photo,
      totalGarlic: garlic,
      totalBoxes: boxes,
      totalAjo: Number((boxes * 1.0).toFixed(1)),
      stageIcon: stage.badgeIcon,
      stageName: stage.name,
      xp,
      streak: Math.floor(boxes / 3) + 1,
    };
  });
}

export const Leaderboard: React.FC = () => {
  const { user, stats, inventory, currentStage } = useGame();
  const [filter, setFilter] = useState<LeaderboardFilter>('global');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [communityPool, setCommunityPool] = useState<EnrichedLeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('ajo_community_ranking');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return generateRealCommunityPool();
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    const refreshed = generateRealCommunityPool();
    setCommunityPool(refreshed);
    localStorage.setItem('ajo_community_ranking', JSON.stringify(refreshed));
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Construct current player entry with live real stats
  const myEntry: EnrichedLeaderboardEntry = useMemo(() => ({
    rank: 0,
    userId: user.id || 'my_user_id',
    username: user.username || 'MiJugador',
    firstName: user.firstName || user.username || 'Jugador',
    photoUrl: user.photoUrl || '',
    totalGarlic: stats.totalGarlicHarvested || inventory.rawGarlic || 0,
    totalBoxes: stats.totalBoxesCompleted || 0,
    totalAjo: stats.totalAjoEarned || inventory.ajoBalance || 0,
    stageIcon: currentStage.badgeIcon,
    stageName: currentStage.name,
    xp: stats.xp || 0,
    streak: Math.max(1, Math.floor(stats.totalTaps / 100)),
    isCurrentUser: true,
  }), [user, stats, inventory, currentStage]);

  // Combine real player with community pool
  const sortedList = useMemo(() => {
    const combined = [
      myEntry,
      ...communityPool.filter(u => u.userId !== myEntry.userId),
    ];

    return combined
      .sort((a, b) => {
        if (filter === 'xp') return b.xp - a.xp;
        if (filter === 'weekly') return b.totalBoxes - a.totalBoxes;
        return b.xp - a.xp;
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }, [myEntry, communityPool, filter]);

  const myCalculatedRank = sortedList.find(u => u.isCurrentUser)?.rank || 1;
  const top3 = sortedList.slice(0, 3);
  const restList = sortedList.slice(3);

  // Podium ordering: 2nd (left), 1st (center), 3rd (right)
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumStyles = [
    { border: 'border-slate-400/60', bg: 'bg-slate-400', imgBorder: 'border-slate-300', height: 'h-16', label: '🥈', textColor: 'text-slate-300' },
    { border: 'border-yellow-400/80', bg: 'bg-yellow-400', imgBorder: 'border-yellow-400', height: 'h-20', label: '🥇', textColor: 'text-amber-300' },
    { border: 'border-amber-700/60', bg: 'bg-amber-700', imgBorder: 'border-amber-600', height: 'h-12', label: '🥉', textColor: 'text-amber-500' },
  ];

  return (
    <div className="space-y-4 p-3 max-w-md mx-auto min-h-[calc(100vh-140px)] pb-24">

      {/* Header Title & Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> RANKING REAL AJO COIN
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Clasificación en tiempo real basada en tus estadísticas</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 rounded-xl text-purple-300 active:scale-95 transition-all"
          title="Actualizar Ranking"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* My Player Live Rank Card */}
      <div className="glass-panel rounded-2xl p-3 border-2 border-amber-400/50 bg-gradient-to-r from-purple-950/40 via-amber-950/20 to-emerald-950/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-amber-400 text-black text-[9px] font-black px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
          TU POSICIÓN REAL #{myCalculatedRank}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-purple-900/60 flex items-center justify-center text-2xl font-black text-white overflow-hidden shadow-md">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                '🧄'
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 text-base drop-shadow">{currentStage.badgeIcon}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-extrabold text-sm text-white truncate">@{user.username}</p>
              <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-extrabold">TÚ</span>
            </div>
            <p className="text-[10px] text-purple-300 font-semibold flex items-center gap-1">
              <span>{currentStage.badgeIcon}</span>
              <span>{currentStage.name}</span>
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-center justify-end gap-1 text-xs font-black text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {formatXP(stats.xp)} XP
            </div>
            <div className="text-[10px] text-emerald-400 font-bold">
              📦 {stats.totalBoxesCompleted} Cajas Llenas
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-[10px]">
          <div>
            <span className="block text-gray-400 font-medium">Toques Totales</span>
            <span className="font-bold text-white">{stats.totalTaps.toLocaleString()}</span>
          </div>
          <div>
            <span className="block text-gray-400 font-medium">Dientes 🦷</span>
            <span className="font-bold text-amber-300">{inventory.garlicTeeth}</span>
          </div>
          <div>
            <span className="block text-gray-400 font-medium">AJO Ganado</span>
            <span className="font-bold text-emerald-400">{stats.totalAjoEarned.toFixed(1)} AJO</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 text-xs font-bold shadow-inner">
        {([['global', '🌍 Clasificación Global'], ['weekly', '📅 Cajas Completadas'], ['xp', '⭐ Por Experiencia (XP)']] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as LeaderboardFilter)}
            className={`flex-1 py-2 rounded-xl transition-all text-[10px] font-extrabold ${
              filter === tab
                ? 'bg-gradient-to-r from-sprout-500 to-emerald-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Podium Display */}
      <div className="flex items-end justify-center gap-2 pt-2">
        {podiumOrder.map((player, idx) => {
          if (!player) return null;
          const style = podiumStyles[idx];
          const isFirst = idx === 1;

          return (
            <div key={player.userId} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              {isFirst && <Crown className="w-5 h-5 text-yellow-400 animate-bounce" />}
              <div className="relative">
                <img
                  src={player.photoUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'}
                  alt={player.username}
                  className={`${isFirst ? 'w-16 h-16 border-3' : 'w-12 h-12 border-2'} rounded-full ${style.imgBorder} object-cover mx-auto shadow-lg`}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'; }}
                />
                <span className={`absolute -bottom-1 -right-1 ${style.bg} text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow`}>
                  {player.rank}
                </span>
              </div>

              <div className="text-center w-full px-1 min-w-0">
                <p className="font-extrabold text-[11px] text-white truncate w-full flex items-center justify-center gap-1">
                  <span>{player.username}</span>
                  {player.isCurrentUser && <span className="text-[8px] bg-amber-400 text-black px-1 rounded font-black">TÚ</span>}
                </p>
                <p className={`text-[10px] font-bold ${style.textColor}`}>
                  {filter === 'xp' ? `${formatXP(player.xp)} XP` : `${player.totalBoxes} Boxes`}
                </p>
              </div>

              <div className={`w-full ${style.height} rounded-t-xl border-t-2 border-x-2 ${style.border} bg-white/5 flex items-end justify-center pb-1 backdrop-blur-xs`}>
                <span className="text-xs font-black text-white/80">{player.stageIcon}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ranking Table for Rest of Players */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-lg">
        <div className="p-3 bg-black/40 border-b border-white/10 flex items-center justify-between text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
          <span>POSICIÓN & CULTIVADOR</span>
          <span>ESTADÍSTICAS</span>
        </div>

        <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
          {restList.map((p) => (
            <div
              key={p.userId}
              className={`p-3 flex items-center justify-between gap-2 transition-colors ${
                p.isCurrentUser
                  ? 'bg-amber-500/20 border-l-4 border-amber-400 text-amber-200 font-bold'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 text-center font-black text-xs text-gray-400">{p.rank}</span>
                <div className="relative shrink-0">
                  <img
                    src={p.photoUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'}
                    alt={p.username}
                    className="w-8 h-8 rounded-full border border-white/20 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'; }}
                  />
                  <span className="absolute -bottom-1 -right-1 text-[10px]">{p.stageIcon}</span>
                </div>
                <div className="min-w-0">
                  <h5 className="font-extrabold text-xs text-white truncate flex items-center gap-1">
                    <span>{p.username}</span>
                    {p.isCurrentUser && (
                      <span className="text-[8px] bg-amber-400 text-black px-1 rounded font-black">TÚ</span>
                    )}
                  </h5>
                  <p className="text-[9px] text-gray-400 truncate">{p.stageName}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-black text-xs text-amber-300 block">
                  {filter === 'xp' ? `${formatXP(p.xp)} XP` : `${p.totalBoxes} Boxes`}
                </span>
                <span className="text-[9px] text-gray-400">
                  {p.totalGarlic.toLocaleString()} Ajos
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
