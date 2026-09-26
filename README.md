# 🚆 RailLexa

> **AI-Powered Indian Railways Traffic Control & Intelligent Dynamic Block Optimization System**  
> *Dedicated to Chennai Region Superfast Railway Network — Southern Railway (MAS Division)*

---

## 🌟 Overview

**RailLexa** is a mission-critical railway operations platform designed to solve track congestion, coordinate inter-departmental track maintenance windows, and provide intelligent real-time traffic scheduling with AI.

- 🚦 **Chief Traffic Controller Portal**: Live train conflict simulation, AI block optimizer, delay impact modeling, and corridor approvals.
- 🛠️ **Department Field Engineer Portals**: Dedicated workspaces for Track Eng (P-Way), Signal & Telecom (S&T), Overhead Electrical (OHE), and Mechanical Coaching Depot (BBQ Yard).
- 📍 **Real-Time Live Train Tracker**: Live GPS and NTES status tracking across the Southern Railway network.
- 🤖 **Azure AI & ML Engine**: Automated safety gatekeeper checklist verification, joint shadow block optimization, and GPT-powered operational assistant.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Leaflet Maps, Canvas-Confetti, Vanilla CSS
- **AI & Optimization**: Azure AI Foundry (GPT-5.6-Luna), ML Block Optimizer
- **Deployment**: Vercel Ready

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_AZURE_AI_KEY=your_azure_ai_key_here
VITE_AZURE_MODEL=gpt-5.6-luna
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 🌐 Deploy to Vercel

1. Import the repository `Negesh44/RailLexa` in [Vercel](https://vercel.com).
2. Add environment variables `VITE_AZURE_AI_KEY` and `VITE_AZURE_MODEL` in project settings.
3. Click **Deploy**.

---

## 👥 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Traffic Controller (MAS)** | `controller@railways.gov.in` | `ctrl123` | Approver & AI Optimizer |
| **Track Eng (MAS P-Way)** | `track.eng@railways.gov.in` | `track123` | Request & Field Safety |
| **Signal & Telecom (S&T)** | `signal.telecom@railways.gov.in` | `signal123` | Request & Field Safety |
| **Electrical (OHE MAS)** | `ohe.electrical@railways.gov.in` | `ohe123` | Request & Field Safety |
| **Mechanical (BBQ Yard)** | `mech.eng@railways.gov.in` | `mech123` | Request & Field Safety |
