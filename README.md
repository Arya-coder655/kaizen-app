# 🌟 KAIZEN (改善) — AI-Powered Personal Life Assistant

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Web Speech API](https://img.shields.io/badge/Web_Speech_API-Voice_Interactive-E34F26)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Continuous Improvement, Every Single Day.**
> Kaizen is an all-in-one personal productivity and life assistant web application crafted with **React 19**, **Vite**, **Tailwind CSS**, and **Lucide Icons**, presented in a bespoke **Beige & Imperial Gold** luxury aesthetic.

---

## 🎨 Theme & Luxury Design System
- **Base Canvas:** Warm Ivory (`#FBF9F4`), Soft Cream (`#FCF9F3`, `#FFFFFF`)
- **Accents:** Imperial Gold (`#C5A059`), Champagne Silk (`#DFCA95`), Deep Burnished Bronze (`#9E7D3B`)
- **Typography:** Playfair Display (Serif Elegance) & Plus Jakarta Sans (Clean Modern Readability)
- **Responsive:** Fluid layout optimized for Desktop, Tablet, and Mobile devices with collapsible mobile sidebar & quick action drawer.

---

## 🚀 Key Modules & Capabilities

### 🎙️ 1. Smart Voice Assistant & Voice Navigation
- **Real-Time Speech Recognition:** Built on the native browser Web Speech API.
- **Natural Voice Feedback:** Interactive Web Speech Synthesis (TTS) replies in natural spoken dialogue.
- **Hands-Free Tab Switching:** Speak naturally to switch between any section of the app.
  - *"Open daily"* / *"Open daily planner"* $\rightarrow$ Opens Daily Planner
  - *"Open tasks"* / *"Open task management"* $\rightarrow$ Opens Tasks Dashboard
  - *"Open habit"* / *"Open habit tracking"* $\rightarrow$ Opens Habit Tracker
  - *"Open expense"* / *"Open expenses"* $\rightarrow$ Opens Expense Tracker
  - *"Open vice"* / *"Open vice tasks"* $\rightarrow$ Opens Vice Breaker
  - *"Open suggestions"* / *"Open AI"* $\rightarrow$ Opens AI Recommendations
  - *"Open reports"* $\rightarrow$ Opens Reports
  - *"Open settings"* $\rightarrow$ Opens App Settings
  - *"Open admin"* $\rightarrow$ Opens Admin Dashboard
- **Voice Task Creation:** Create and schedule new tasks instantly via voice commands.

### 📅 2. Multi-Mode Daily Planner
- **3 Dynamic Views:**
  1. **Timeline View:** Hourly schedule block (06:00 to 22:00) with real-time "Happening Now" status banner.
  2. **Multi-Day Matrix:** Side-by-side multi-day overview for comprehensive weekly clarity.
  3. **Agenda View:** Chronological list breakdown with quick status toggles.
- **Circadian Rhythm Guide:** High Energy, Focus Zone, Rest & Recharge phase suggestions tailored to biological productivity windows.
- **1-Click AI Auto-Plan:** Instantly distributes high-priority pending items into optimal time slots.

### ⚡ 3. Intelligent Task Management & Loop Reminders
- **Priority Matrix:** Smart Eisenhower categorization (Urgent/Important) with AI priority reasoning.
- **Procrastination Breaker:** Identifies overdue or stagnating tasks and breaks them into atomic 5-minute starter steps.
- **Loop Notifications & Sound Drop:** Audio chime alert and automated periodic 10-minute browser reminders for mission-critical tasks.

### 🧘 4. Vice & Habit Transformation
- **Abstinence Streak Counter:** Real-time day counter, urge logger, trigger tracking, and healthy replacement habits.
- **7-Day Consistency Matrix:** Visual habit heatmap with progress bars and habit strength ratings.

### 💰 5. Financial & Expense Tracking
- **Budget Intelligence:** Monthly spending limits with dynamic percentage utilization meters.
- **Category Breakdown:** Real-time distribution across Housing, Food, Learning, Tech, and Wellness.

### 📊 6. Productivity Reports & Activity Audit Trail
- Comprehensive productivity index score, completion breakdown, and CSV data export.
- Full chronological activity audit log tracking every user action.

### 🛡️ 7. Role-Based Access Control & Admin Suite
- Switch seamlessly between **Regular User** and **Admin** profiles.
- Full Admin Control: User management table, system-wide task ledger, and JSON **Backup & Restore** engine.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite 8](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Audio & Voice:** Native Web Speech API (`webkitSpeechRecognition`, `speechSynthesis`, Web Audio API sound synthesizer)

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Arya-coder655/kaizen-app.git
   cd kaizen-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled static assets will be ready in the `dist/` directory.

5. **Preview production build locally:**
   ```bash
   npm run preview
   ```

---

## 👤 Demo Credentials

Test accounts are pre-configured with 1-click login buttons in the Sign In modal:

| Role | Email | Password |
|---|---|---|
| **Regular User** | `alex.vance@kaizen.ai` | `password123` |
| **System Admin** | `admin@kaizen.ai` | `adminpassword` |

*(You can also use the role toggle in the top navigation bar at any time).*

---

## 🌐 Deploy to Production

### Deploy to Vercel (Recommended)
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import `kaizen-app` and select **Vite** as framework preset.
4. Click **Deploy**.

### Deploy to Netlify
1. Connect your GitHub repository to [Netlify](https://netlify.com/).
2. Set Build Command: `npm run build`
3. Set Publish Directory: `dist`
4. Click **Deploy Site**.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
