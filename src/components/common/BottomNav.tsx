import React from 'react';
import { useGame } from '../../context/GameContext';
import { NavigationTab } from '../../types';
import { triggerHaptic } from '../../utils/haptics';
import { Sprout, Package, Palette, Trophy, User, ShieldCheck } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, user } = useGame();

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'farm', label: 'Cultivo', icon: <Sprout className="w-5 h-5 text-emerald-400" /> },
    { id: 'inventory', label: 'Cajas', icon: <Package className="w-5 h-5 text-amber-400" /> },
    { id: 'skins', label: 'Skins', icon: <Palette className="w-5 h-5 text-purple-400" /> },
    { id: 'rank', label: 'Ranking', icon: <Trophy className="w-5 h-5 text-yellow-400" /> },
    { id: 'profile', label: 'Perfil', icon: <User className="w-5 h-5 text-sky-400" /> },
  ];

  if (user.isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: <ShieldCheck className="w-5 h-5 text-rose-400" /> });
  }

  const handleTabChange = (tabId: NavigationTab) => {
    triggerHaptic('light');
    setActiveTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-purple-500/30 px-2 py-2 shadow-2xl backdrop-blur-xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-b from-purple-500/20 to-emerald-600/30 text-white border border-purple-500/40 scale-105 shadow-lg shadow-purple-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isActive ? 'text-sprout-300' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
