import React, { useState, useEffect } from "react";
import { Train, Activity, Github, Terminal, Code2, Clock } from "lucide-react";

interface NavbarProps {
  activeTab: "tracker" | "api" | "docs";
  setActiveTab: (tab: "tracker" | "api" | "docs") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [istTime, setIstTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Indian Standard Time (UTC+5:30)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setIstTime(new Intl.DateTimeFormat("en-IN", options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Train className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                RailTrack <span className="text-emerald-400 font-mono text-xs sm:text-sm font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">LIVE API</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Live Indian Railways Running Status Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            id="tab-btn-tracker"
            onClick={() => setActiveTab("tracker")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              activeTab === "tracker"
                ? "bg-emerald-500 text-slate-950 font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Tracker</span>
          </button>

          <button
            id="tab-btn-api"
            onClick={() => setActiveTab("api")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              activeTab === "api"
                ? "bg-emerald-500 text-slate-950 font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API Playground</span>
          </button>

          <button
            id="tab-btn-docs"
            onClick={() => setActiveTab("docs")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              activeTab === "docs"
                ? "bg-emerald-500 text-slate-950 font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>API Docs</span>
          </button>
        </nav>

        {/* Right Info & Status */}
        <div className="flex items-center gap-3">
          {/* IST Time */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800/80 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{istTime || "IST"}</span>
          </div>

          {/* GitHub Source Attribution Badge */}
          <a
            id="github-repo-link"
            href="https://github.com/Arkapravo-Ghosh/TrainTrack"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors"
            title="Extracted from GitHub: Arkapravo-Ghosh/TrainTrack & chandrkant/railyatri.api"
          >
            <Github className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline font-mono">Source Repo</span>
          </a>
        </div>
      </div>
    </header>
  );
};
