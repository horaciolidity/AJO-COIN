import React from 'react';
import { useGame } from '../../context/GameContext';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { toast } = useGame();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-400 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-500/40 bg-emerald-950/80',
    info: 'border-blue-500/40 bg-blue-950/80',
    warning: 'border-yellow-500/40 bg-yellow-950/80',
    error: 'border-red-500/40 bg-red-950/80',
  };

  return (
    <div key={toast.id} className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm pointer-events-none animate-bounce-short">
      <div className={`glass-panel border ${borderColors[toast.type]} rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 backdrop-blur-xl`}>
        {icons[toast.type]}
        <div className="flex-1 overflow-hidden">
          <h4 className="text-xs font-bold text-white truncate">{toast.title}</h4>
          <p className="text-[11px] text-gray-300 leading-snug">{toast.message}</p>
        </div>
      </div>
    </div>
  );
};
