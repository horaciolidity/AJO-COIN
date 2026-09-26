import React from 'react';
import { useGame } from '../../context/GameContext';
import { NavigationTab } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, user } = useGame();

  const navItems: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'farm', label: 'Cultivo', icon: '🧄' },
    { id: 'inventory', label: 'Cajas', icon: '📦' },
    { id: 'skins', label: 'Skins', icon: '🥷' },
    { id: 'rank', label: 'Ranking', icon: '🏆' },
    { id: 'profile', label: 'Perfil', icon: '👤' },
  ];

  if (user.isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: '🛠️' });
  }

  const handleTabChange = (tabId: NavigationTab) => {
    triggerHaptic('light');
    setActiveTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-purple-500/30 px-2 py-1.5 shadow-2xl backdrop-blur-xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-b from-sprout-500/20 to-emerald-600/30 text-sprout-400 border border-sprout-500/40 scale-105 shadow-lg shadow-sprout-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-sprout-400' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
