import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Mic,
  Bell,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  ChevronDown,
  Check,
  CheckCircle2,
  Clock,
  KeyRound,
  Droplets
} from 'lucide-react';

export default function Navbar({ onToggleSidebar, isSidebarOpen, onOpenVoiceAssistant }) {
  const {
    currentUser,
    setCurrentScreen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setAuthModalOpen,
    setAuthMode,
    logout,
    playDropSound,
    showToast
  } = useApp();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-[#FBF9F4]/90 backdrop-blur-md border-b border-[#DFCA95]/40 px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile toggle + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-[#F5EFEB] border border-[#DFCA95]/40"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5 text-[#C5A059]" /> : <Menu className="w-5 h-5 text-[#C5A059]" />}
          </button>

          <div
            onClick={() => setCurrentScreen('dashboard')}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9E7D3B] via-[#C5A059] to-[#D4AF37] p-[1.5px] shadow-sm group-hover:shadow-md transition">
              <div className="w-full h-full bg-[#FCF9F3] rounded-[10px] flex items-center justify-center">
                <span className="text-[#9E7D3B] font-serif font-black text-sm tracking-wider">改</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-lg tracking-wider text-stone-900">KAIZEN</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-[#F3E8CB] text-[#7A5C24] border border-[#DFCA95]">
                  AI 2.4
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium tracking-tight hidden sm:block">
                Continuous Improvement Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Voice Action + Notifications + Role Switcher + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Voice Assistant Button */}
          <button
            onClick={() => {
              if (onOpenVoiceAssistant) {
                onOpenVoiceAssistant();
              } else {
                setCurrentScreen('voice_task');
              }
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95]/30 to-[#C5A059]/20 hover:from-[#DFCA95]/50 hover:to-[#C5A059]/30 text-stone-900 border border-[#DFCA95] text-xs font-semibold shadow-xs transition active:scale-95"
            title="Kaizen Smart Voice Assistant"
          >
            <div className="relative">
              <Mic className="w-4 h-4 text-[#9E7D3B]" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-ping" />
            </div>
            <span className="hidden md:inline text-stone-800">Voice AI</span>
          </button>

          {/* Quick Drop Sound Test */}
          <button
            onClick={() => {
              playDropSound();
              showToast('Drop sound played (Synthesized audio alert)');
            }}
            className="p-2 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition active:scale-95"
            title="Test 10-Minute Loop Drop Sound Alert"
          >
            <Droplets className="w-5 h-5 text-amber-600" />
          </button>

          {/* Notifications Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setProfileDropdownOpen(false);
              }}
              className="relative p-2 rounded-xl text-stone-700 hover:bg-[#F5EFEB] border border-[#DFCA95]/40 transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-stone-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C5A059] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#FBF9F4] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setNotifDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-white rounded-2xl shadow-xl border border-[#DFCA95] p-3 text-left z-50 animate-scale-in">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F5EFEB]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#9E7D3B]" />
                      <span className="font-semibold text-sm text-stone-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-[#F7E7CE] text-[#7A5C24] font-semibold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-[#9E7D3B] hover:text-[#7A5C24] font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.slice(0, 5).map(n => (
                      <div
                        key={n.notificationId}
                        onClick={() => markNotificationRead(n.notificationId)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                          !n.read
                            ? 'bg-[#FCF9F3] border-[#DFCA95] font-medium'
                            : 'bg-stone-50/50 border-stone-100 text-stone-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="font-semibold text-stone-800">{n.title}</span>
                          <span className="text-[10px] text-stone-400 whitespace-nowrap">{n.createdAt}</span>
                        </div>
                        <p className="text-stone-600 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-xs text-stone-400 text-center py-4">No notifications</p>
                    )}
                  </div>

                  <div className="pt-2 mt-2 border-t border-[#F5EFEB] text-center">
                    <button
                      onClick={() => {
                        setCurrentScreen('notifications');
                        setNotifDropdownOpen(false);
                      }}
                      className="text-xs font-semibold text-[#9E7D3B] hover:underline"
                    >
                      View Notification Center →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotifDropdownOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F5EFEB] border border-[#DFCA95]/40 transition"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover border border-[#DFCA95]"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-stone-900 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-stone-500 capitalize">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-[240px] sm:w-56 bg-white rounded-2xl shadow-xl border border-[#DFCA95] p-2 text-left z-50 animate-scale-in">
                  <div className="px-3 py-2 border-b border-[#F5EFEB]">
                    <p className="text-xs font-bold text-stone-900">{currentUser.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md bg-[#F5EFEB] text-[#9E7D3B] font-medium uppercase tracking-wider">
                      ID: {currentUser.userId}
                    </span>
                  </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setCurrentScreen('profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-[#FCF9F3] hover:text-[#9E7D3B] rounded-lg transition"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentScreen('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-[#FCF9F3] hover:text-[#9E7D3B] rounded-lg transition"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings & Preferences</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#F5EFEB]">
                  <button
                    onClick={() => {
                      setCurrentScreen('auth');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-[#FCF9F3] hover:text-[#9E7D3B] rounded-lg transition"
                  >
                    <KeyRound className="w-4 h-4 text-[#9E7D3B]" />
                    <span>Switch Account / Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </header>
  );
}
