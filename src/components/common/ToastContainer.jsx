import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map(toast => {
        let icon = <CheckCircle2 className="w-5 h-5 text-[#C5A059]" />;
        let borderClass = "border-[#DFCA95]";
        let bgClass = "bg-[#FCF9F3]";

        if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
          borderClass = "border-amber-300";
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-stone-500" />;
          borderClass = "border-stone-300";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-lg border ${borderClass} ${bgClass} text-stone-900 transition-all duration-300 animate-slide-up`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-medium tracking-tight text-stone-800">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-600 p-1 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
