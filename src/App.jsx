import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ToastContainer from './components/common/ToastContainer';
import AuthModal from './components/common/AuthModal';
import VoiceAssistantHUD from './components/common/VoiceAssistantHUD';

import AuthScreen from './components/screens/AuthScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import TasksScreen from './components/screens/TasksScreen';
import ViceTasksScreen from './components/screens/ViceTasksScreen';
import RemindersScreen from './components/screens/RemindersScreen';
import DailyPlannerScreen from './components/screens/DailyPlannerScreen';
import HabitsScreen from './components/screens/HabitsScreen';
import ExpensesScreen from './components/screens/ExpensesScreen';
import ActivityHistoryScreen from './components/screens/ActivityHistoryScreen';
import NotificationsScreen from './components/screens/NotificationsScreen';
import AiSuggestionsScreen from './components/screens/AiSuggestionsScreen';
import VoiceTaskScreen from './components/screens/VoiceTaskScreen';
import ReportsScreen from './components/screens/ReportsScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import SettingsScreen from './components/screens/SettingsScreen';

import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Flame,
  Mic,
  Menu
} from 'lucide-react';

function MainApp() {
  const { currentScreen, setCurrentScreen, isAuthenticated, authModalOpen, setAuthModalOpen } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceHudOpen, setVoiceHudOpen] = useState(false);

  // If user is not authenticated, present the full-page Login & Sign Up screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] text-[#1E1B18] antialiased selection:bg-[#F3E8CB] selection:text-[#7A5C24]">
        <AuthScreen />
        <ToastContainer />
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'tasks':
        return <TasksScreen />;
      case 'vice_tasks':
        return <ViceTasksScreen />;
      case 'reminders':
        return <RemindersScreen />;
      case 'planner':
        return <DailyPlannerScreen />;
      case 'habits':
        return <HabitsScreen />;
      case 'expenses':
        return <ExpensesScreen />;
      case 'activity_history':
        return <ActivityHistoryScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'ai_suggestions':
        return <AiSuggestionsScreen />;
      case 'voice_task':
        return <VoiceTaskScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'auth':
      case 'login':
        return <AuthScreen initialMode="login" />;
      case 'signup':
        return <AuthScreen initialMode="signup" />;
      default:
        return <DashboardScreen />;
    }
  };

  const mobileNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'planner', label: 'Planner', icon: CalendarDays },
    { id: 'habits', label: 'Habits', icon: Flame },
    { id: 'voice_task', label: 'Voice', icon: Mic }
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1E1B18] flex flex-col antialiased selection:bg-[#F3E8CB] selection:text-[#7A5C24]">
      <div className="flex flex-1 relative">
        {/* Sidebar Drawer */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            isSidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onOpenVoiceAssistant={() => setVoiceHudOpen(true)}
          />

          <main className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
            {renderScreen()}
          </main>
        </div>
      </div>

      {/* Floating Desktop Voice Assistant Trigger Button */}
      <button
        onClick={() => setVoiceHudOpen(true)}
        className="hidden lg:flex fixed bottom-6 right-6 z-40 items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white font-semibold text-xs shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all group"
        title="Activate Kaizen Smart Voice Assistant"
      >
        <div className="relative">
          <Mic className="w-4 h-4 text-white group-hover:scale-110 transition" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <span>Voice Assistant</span>
      </button>

      {/* Mobile Sticky Bottom Navigation Bar (Smartphones & Small Tablets) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FCF9F3]/95 backdrop-blur-md border-t border-[#DFCA95]/40 px-2 py-1.5 flex items-center justify-around shadow-lg"
      >
        {mobileNavItems.map(item => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-[#7A5C24] font-bold bg-[#F3E8CB]/70'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#9E7D3B]' : 'text-stone-500'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* More button to toggle full drawer */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-stone-500 hover:text-stone-800 transition-all"
        >
          <Menu className="w-5 h-5 text-stone-500" />
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
        </button>
      </nav>

      {/* Voice Assistant HUD Modal */}
      <VoiceAssistantHUD
        isOpen={voiceHudOpen}
        onClose={() => setVoiceHudOpen(false)}
      />

      {/* Global Modals & Notifications */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
