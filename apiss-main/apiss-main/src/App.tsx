import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { TrainSelector } from "./components/TrainSelector";
import { LiveStatusBanner } from "./components/LiveStatusBanner";
import { StationTimeline } from "./components/StationTimeline";
import { ApiConsole } from "./components/ApiConsole";
import { ApiDocumentation } from "./components/ApiDocumentation";
import { LiveTrainResponse } from "./types";
import { AlertCircle, Terminal, ExternalLink, Activity, ArrowRight, Github, Sparkles } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"tracker" | "api" | "docs">("tracker");
  const [trainNumber, setTrainNumber] = useState<string>("12951"); // Default: Mumbai Central - New Delhi Rajdhani
  const [dayOffset, setDayOffset] = useState<number>(0);
  const [liveData, setLiveData] = useState<LiveTrainResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (num: string, day: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/train/${num}/live?day=${day}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to retrieve train status");
      }
      setLiveData(data);
    } catch (err: any) {
      console.error("Fetch status error:", err);
      setError(err.message || "Unable to fetch live train running status.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStatus(trainNumber, dayOffset);
  }, [trainNumber, dayOffset, fetchStatus]);

  const handleSelectTrain = (num: string) => {
    setTrainNumber(num);
  };

  const handleSelectDay = (day: number) => {
    setDayOffset(day);
  };

  const handleRefresh = () => {
    fetchStatus(trainNumber, dayOffset);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Hero / Context Header for API Developers */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900/60 border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Indian Railways Live Status API
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  v1.0 REST
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Extracts live GPS & NTES train telemetry. Ready to consume via <code className="font-mono text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">/api/train/:trainNumber/live</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("api")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-sm shadow-emerald-500/20"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>API Playground</span>
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors"
            >
              <span>View Docs</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Train Search and Filter Bar */}
        <TrainSelector
          currentTrainNumber={trainNumber}
          onSelectTrain={handleSelectTrain}
          dayOffset={dayOffset}
          onSelectDay={handleSelectDay}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />

        {/* Error Alert Card */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Error retrieving live status:</span> {error}
              <div className="mt-1 text-slate-400">
                Tip: Verify the train number (e.g. 12951, 12625, 12301) or switch the departure day to Yesterday (-1) / Day Before (-2).
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Live Tracker View */}
        {activeTab === "tracker" && (
          <div className="space-y-6">
            {isLoading && !liveData ? (
              <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
                <Activity className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
                <p className="text-sm font-mono text-slate-300">
                  Extracting live train running telemetry from upstream servers...
                </p>
              </div>
            ) : liveData ? (
              <>
                <LiveStatusBanner data={liveData} />
                <StationTimeline
                  stations={liveData.stations}
                  currentStationCode={liveData.current_station_code}
                  totalDistanceKm={liveData.total_distance_km}
                />
              </>
            ) : null}
          </div>
        )}

        {/* Tab 2: Interactive API Console & Code Generator */}
        {activeTab === "api" && (
          <ApiConsole
            trainNumber={trainNumber}
            dayOffset={dayOffset}
            liveData={liveData}
            isLoading={isLoading}
            onExecute={handleRefresh}
          />
        )}

        {/* Tab 3: API Reference Documentation */}
        {activeTab === "docs" && <ApiDocumentation />}
      </main>

      {/* Footer with Open Source Attribution */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>RailTrack Live API</span>
            <span>•</span>
            <span className="text-slate-400">Extracts live Indian Railways status for developer consumption</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">Powered by Open Source:</span>
            <a
              href="https://github.com/Arkapravo-Ghosh/TrainTrack"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Arkapravo-Ghosh/TrainTrack</span>
            </a>
            <span>&</span>
            <a
              href="https://github.com/chandrkant/railyatri.api"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              <span>railyatri.api</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
