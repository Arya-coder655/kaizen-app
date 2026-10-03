import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import {
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  ShieldCheck,
  Calendar,
  Sparkles,
  CheckCircle2,
  Flame,
  Camera,
  Save,
  LogOut,
  Upload,
  Image,
  RefreshCw,
  Check,
  X
} from 'lucide-react';

const PRESET_AVATARS = [
  {
    id: 'user-default',
    name: 'Alex Vance',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    tag: 'Classic'
  },
  {
    id: 'executive-focus',
    name: 'Executive Leader',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    tag: 'Executive'
  },
  {
    id: 'mindful-focus',
    name: 'Mindful Sage',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    tag: 'Zen'
  },
  {
    id: 'deep-work',
    name: 'Tech Architect',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    tag: 'Focus'
  },
  {
    id: 'creative-lead',
    name: 'Creative Director',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    tag: 'Creative'
  },
  {
    id: 'kaizen-gold',
    name: 'Kaizen Monogram',
    url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23FCF9F3'/><circle cx='50' cy='50' r='42' fill='%23F5EFEB' stroke='%23C5A059' stroke-width='3'/><text x='50' y='64' font-family='serif' font-size='42' font-weight='bold' fill='%239E7D3B' text-anchor='middle'>改</text></svg>",
    tag: 'Gold Emblem'
  }
];

export default function ProfileScreen() {
  const { currentUser, updateProfile, changePassword, logout, tasks, habits, viceTasks, showToast } = useApp();

  const fileInputRef = useRef(null);
  const [isPfpModalOpen, setIsPfpModalOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || '',
    bio: currentUser.bio || '',
    avatar: currentUser.avatar || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Temporary avatar URL in PFP modal
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Handle local image file upload from device
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please upload a valid image file (PNG, JPG, WebP).", "warning");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      showToast("Image size exceeds 4MB. Please select a smaller photo.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setProfileData(prev => ({ ...prev, avatar: dataUrl }));
      updateProfile({ avatar: dataUrl });
      setIsPfpModalOpen(false);
      showToast("Profile photo updated from device upload!", "gold");

      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 }, colors: ['#D4AF37', '#C5A059', '#FCF9F3'] });
      } catch (err) {}
    };
    reader.readAsDataURL(file);
  };

  // Choose preset avatar
  const handleSelectPreset = (presetUrl) => {
    setProfileData(prev => ({ ...prev, avatar: presetUrl }));
    updateProfile({ avatar: presetUrl });
    setIsPfpModalOpen(false);
    showToast("Profile picture updated to selected preset!", "gold");

    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, colors: ['#D4AF37', '#C5A059', '#FFF'] });
    } catch (err) {}
  };

  // Apply custom URL
  const handleApplyCustomUrl = (e) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    setProfileData(prev => ({ ...prev, avatar: customUrlInput.trim() }));
    updateProfile({ avatar: customUrlInput.trim() });
    setIsPfpModalOpen(false);
    setCustomUrlInput('');
    showToast("Profile picture updated from custom web URL!", "gold");
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile(profileData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New password and confirmation do not match!", "warning");
      return;
    }
    const success = changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const bestAbstinence = Math.max(...viceTasks.map(v => v.abstinenceDays), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Hidden File Input for Device Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#FCF9F3] to-[#F5EFEB] p-6 rounded-3xl border border-[#DFCA95]/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-[#9E7D3B]" />
            <h2 className="font-serif font-bold text-2xl text-stone-900">User Profile & Account</h2>
          </div>
          <p className="text-xs text-stone-500">
            Section 4: ER User Entity management (User ID, Name, Email, Phone, Password & Profile Picture).
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Overview Card with Interactive PFP Changer */}
      <div className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          
          {/* Interactive Avatar with Camera Overlay */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-3xl p-1 bg-gradient-to-tr from-[#9E7D3B] via-[#C5A059] to-[#D4AF37] shadow-md">
              <img
                src={profileData.avatar || currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full rounded-[22px] object-cover bg-white"
              />
            </div>

            {/* Hover Camera Overlay Button */}
            <button
              type="button"
              onClick={() => setIsPfpModalOpen(true)}
              className="absolute inset-1 rounded-[22px] bg-stone-900/60 backdrop-blur-xs text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 shadow-inner cursor-pointer"
              title="Change Profile Picture"
            >
              <Camera className="w-6 h-6 text-[#DFCA95]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Change PFP</span>
            </button>

            {/* Quick floating Camera Badge for mobile/touch */}
            <button
              type="button"
              onClick={() => setIsPfpModalOpen(true)}
              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-[#C5A059] hover:bg-[#9E7D3B] text-white border-2 border-white shadow-md flex items-center justify-center transition active:scale-95"
              title="Update Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h3 className="font-serif font-bold text-xl text-stone-900">{currentUser.name}</h3>
              <div className="flex items-center justify-center md:justify-start gap-1.5">
                <span className="text-[10px] font-mono font-bold text-[#7A5C24] bg-[#F3E8CB] px-2 py-0.5 rounded-full border border-[#DFCA95]">
                  ID: {currentUser.userId}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C5A059] text-white px-2 py-0.5 rounded-full">
                  Kaizen Member
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 max-w-xl leading-relaxed">{currentUser.bio}</p>

            <div className="flex items-center justify-center md:justify-start gap-4 text-[11px] text-stone-500 pt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#9E7D3B]" />
                {currentUser.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#9E7D3B]" />
                {currentUser.phone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#9E7D3B]" />
                Joined: {currentUser.joinedDate}
              </span>
            </div>

            {/* Quick Change PFP Action Link */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsPfpModalOpen(true)}
                className="text-xs font-semibold text-[#9E7D3B] hover:text-[#7A5C24] flex items-center gap-1.5 mx-auto md:mx-0 group"
              >
                <Camera className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                <span>Customize Profile Picture (Upload, Presets or URL) →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Achievement Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 pt-6 border-t border-[#F5EFEB]">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 text-center">
            <div className="text-base sm:text-xl font-serif font-bold text-stone-900">{completedCount}</div>
            <span className="text-[9px] sm:text-[10px] text-stone-500 font-medium leading-tight block">Completed Tasks</span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 text-center">
            <div className="text-base sm:text-xl font-serif font-bold text-[#9E7D3B]">{habits.length}</div>
            <span className="text-[9px] sm:text-[10px] text-stone-500 font-medium leading-tight block">Habits Tracked</span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 text-center">
            <div className="text-base sm:text-xl font-serif font-bold text-emerald-700">{bestAbstinence}d</div>
            <span className="text-[9px] sm:text-[10px] text-stone-500 font-medium leading-tight block">Cleanest Streak</span>
          </div>
        </div>
      </div>

      {/* Forms Grid: Edit Profile & Change Password */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit Profile Form */}
        <div className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB] mb-4">
            <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <User className="w-4 h-4 text-[#9E7D3B]" />
              <span>Edit Profile Details</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsPfpModalOpen(true)}
              className="text-xs font-semibold text-[#9E7D3B] hover:underline flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change PFP</span>
            </button>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">User Name (ER Field)</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">User Email (ER Field)</label>
              <input
                type="email"
                required
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">User Phone (ER Field)</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-600">Profile Picture (PFP)</label>
                <button
                  type="button"
                  onClick={() => setIsPfpModalOpen(true)}
                  className="text-[11px] text-[#9E7D3B] hover:underline font-semibold"
                >
                  Open Photo Picker
                </button>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src={profileData.avatar || currentUser.avatar}
                  alt="Thumb"
                  className="w-9 h-9 rounded-xl object-cover border border-[#DFCA95] shrink-0"
                />
                <input
                  type="text"
                  placeholder="Paste image URL or use photo picker..."
                  value={profileData.avatar}
                  onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Personal Bio</label>
              <textarea
                rows="2"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-xs hover:brightness-105 transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Update Profile Details</span>
            </button>
          </form>
        </div>

        {/* Change Password Form (Section 4 FR-04) */}
        <div className="p-6 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs">
          <h4 className="font-serif font-bold text-base text-stone-900 mb-4 pb-3 border-b border-[#F5EFEB] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#9E7D3B]" />
            <span>Change Account Password (FR-04)</span>
          </h4>

          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Current Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
              />
            </div>

            <div className="p-3 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40 text-[11px] text-stone-600">
              Passphrase is encrypted under Kaizen secure credential guidelines.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-[#C5A059]" />
              <span>Update Password</span>
            </button>
          </form>
        </div>
      </div>

      {/* DEDICATED PFP MODAL (Change Profile Picture) */}
      {isPfpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#9E7D3B]" />
                <h3 className="font-serif font-bold text-lg text-stone-900">Change Profile Picture</h3>
              </div>
              <button
                onClick={() => setIsPfpModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#F5EFEB] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Avatar Preview */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/50">
              <img
                src={profileData.avatar || currentUser.avatar}
                alt="Active Preview"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#DFCA95] shadow-xs"
              />
              <div>
                <p className="text-xs font-bold text-stone-900">Active Profile Photo</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Appears in your top navigation, activity feeds & reports.
                </p>
              </div>
            </div>

            {/* Option 1: Upload from Device */}
            <div>
              <p className="text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#9E7D3B]" />
                <span>Option 1: Upload Custom Photo from Device</span>
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 border-2 border-dashed border-[#DFCA95] hover:border-[#9E7D3B] bg-[#FCF9F3]/60 hover:bg-[#FCF9F3] rounded-2xl text-xs font-semibold text-stone-800 transition flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#9E7D3B] group-hover:scale-110 transition" />
                <span>Select Image File from Computer / Mobile (PNG, JPG, WebP)</span>
              </button>
            </div>

            {/* Option 2: Curated Luxury Presets */}
            <div>
              <p className="text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                <span>Option 2: Select a Mindful Curated Avatar</span>
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {PRESET_AVATARS.map(avatar => {
                  const isSelected = (profileData.avatar || currentUser.avatar) === avatar.url;
                  return (
                    <div
                      key={avatar.id}
                      onClick={() => handleSelectPreset(avatar.url)}
                      className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all p-0.5 group ${
                        isSelected
                          ? 'border-[#C5A059] ring-2 ring-[#DFCA95] scale-105 shadow-sm'
                          : 'border-stone-200 hover:border-[#DFCA95]'
                      }`}
                    >
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-full h-14 object-cover rounded-xl"
                      />
                      <span className="block text-[9px] font-bold text-stone-700 text-center truncate pt-1">
                        {avatar.tag}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C5A059] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Option 3: Web Image URL */}
            <form onSubmit={handleApplyCustomUrl} className="space-y-2">
              <p className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-[#9E7D3B]" />
                <span>Option 3: Paste Web Image URL</span>
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition"
                >
                  Apply URL
                </button>
              </div>
            </form>

            <div className="flex justify-end pt-2 border-t border-[#F5EFEB]">
              <button
                type="button"
                onClick={() => setIsPfpModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-[#F5EFEB] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
