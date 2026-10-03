import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  ShieldAlert,
  Bell,
  CalendarDays,
  Flame,
  Wallet,
  History,
  Sparkles,
  Mic,
  BarChart3,
  User,
  Settings,
  LogOut,
  KeyRound,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const {
    currentScreen,
    setCurrentScreen,
    tasks,
    viceTasks,
    reminders,
    habits,
    notifications,
    currentUser,
    logout
  } = useApp();

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const activeVicesCount = viceTasks.filter(v => v.status === 'active').length;
  const upcomingRemindersCount = reminders.filter(r => r.status === 'upcoming').length;
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const navSections = [
    {
      label: "Overview",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      label: "Productivity",
      items: [
        { id: 'tasks', label: 'Task Management', icon: CheckSquare, badge: pendingTasksCount },
        { id: 'vice_tasks', label: 'Vice Tasks', icon: ShieldAlert, badge: activeVicesCount, badgeColor: 'bg-amber-100 text-amber-800' },
        { id: 'reminders', label: 'Reminders', icon: Bell, badge: upcomingRemindersCount },
        { id: 'planner', label: 'Daily Planner', icon: CalendarDays }
      ]
    },
    {
      label: "Tracking & Habits",
      items: [
        { id: 'habits', label: 'Habit Tracking', icon: Flame, badge: `${habits.length}` },
        { id: 'expenses', label: 'Expense Tracking', icon: Wallet },
        { id: 'activity_history', label: 'Activity History', icon: History }
      ]
    },
    {
      label: "AI Services",
      items: [
        { id: 'ai_suggestions', label: 'AI Suggestions', icon: Sparkles, highlight: true },
        { id: 'voice_task', label: 'Voice Task Entry', icon: Mic },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
      ]
    },
    {
      label: "System & Profile",
      items: [
        { id: 'profile', label: 'User Profile', icon: User },
        { id: 'auth', label: 'Sign In / Register', icon: KeyRound },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount, badgeColor: 'bg-[#C5A059] text-white' },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  const handleNavClick = (screenId) => {
    setCurrentScreen(screenId);
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-[#FCF9F3] border-r border-[#DFCA95]/40 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header inside sidebar */}
        <div className="p-5 border-b border-[#DFCA95]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9E7D3B] via-[#C5A059] to-[#D4AF37] p-[1.5px] shadow-sm">
              <div className="w-full h-full bg-[#FCF9F3] rounded-[10px] flex items-center justify-center">
                <span className="text-[#9E7D3B] font-serif font-black text-base">改</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif font-bold text-lg text-stone-900 tracking-wider">KAIZEN</h1>
                <span className="text-[10px] font-semibold bg-[#F3E8CB] text-[#7A5C24] px-1.5 py-0.5 rounded-full border border-[#DFCA95]/50">
                  AI ASSISTANT
                </span>
              </div>
              <p className="text-[11px] text-stone-500">1% Better Every Single Day</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-[#F5EFEB] transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-[#9E7D3B]" />
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navSections.map(section => {
            const visibleItems = section.items;
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.label}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3 mb-1.5">
                  {section.label}
                </p>
                <div className="space-y-1">
                  {visibleItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentScreen === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-gradient-to-r from-[#DFCA95]/40 to-[#F5EFEB] text-[#7A5C24] font-semibold shadow-xs border border-[#DFCA95]/60'
                            : 'text-stone-700 hover:bg-[#F5EFEB] hover:text-stone-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 transition ${
                              isActive
                                ? 'text-[#9E7D3B]'
                                : item.highlight
                                ? 'text-[#C5A059] animate-pulse'
                                : 'text-stone-500 group-hover:text-stone-800'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {item.badge !== undefined && item.badge !== 0 && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                item.badgeColor || 'bg-[#F5EFEB] text-stone-700 border border-[#DFCA95]/40'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          {item.highlight && !item.badge && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer User Profile Card & Quick Logout */}
        <div className="p-4 border-t border-[#DFCA95]/30 bg-[#FBF9F4]">
          <div
            onClick={() => handleNavClick('profile')}
            className="cursor-pointer p-3 rounded-2xl bg-gradient-to-br from-[#FFFFFF] to-[#FCF9F3] border border-[#DFCA95]/60 shadow-xs mb-2 hover:border-[#C5A059] transition group"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-[#DFCA95] group-hover:scale-105 transition"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-stone-800 truncate">{currentUser.name}</p>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#F3E8CB] text-[#7A5C24]">
                    Member
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
