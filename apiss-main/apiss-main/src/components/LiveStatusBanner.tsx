import React from "react";
import { 
  Train, 
  MapPin, 
  Clock, 
  Gauge, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Navigation
} from "lucide-react";
import { LiveTrainResponse } from "../types";

interface LiveStatusBannerProps {
  data: LiveTrainResponse;
}

export const LiveStatusBanner: React.FC<LiveStatusBannerProps> = ({ data }) => {
  const isDelayed = data.delay_minutes > 5;
  const isEarly = data.delay_minutes < -3;
  const isYetToStart = data.status === "YET_TO_START";
  const isReached = data.status === "REACHED_DESTINATION";

  return (
    <div id="live-status-banner" className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className={`absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
        isDelayed ? "bg-amber-500" : isReached ? "bg-cyan-500" : "bg-emerald-500"
      }`} />

      {/* Train Identification Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-extrabold text-sm border border-emerald-500/30">
              #{data.train_number}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {data.train_name}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-mono mt-1.5 flex-wrap">
            <span className="text-slate-200 font-semibold">{data.source} ({data.source_code})</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-200 font-semibold">{data.destination} ({data.destination_code})</span>
            <span className="text-slate-600">•</span>
            <span>{data.total_distance_km} km</span>
            <span className="text-slate-600">•</span>
            <span>Started: {data.start_date}</span>
          </div>
        </div>

        {/* Primary Status Pill */}
        <div className="flex items-center gap-2">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-sm font-semibold shadow-sm ${
            isReached
              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
              : isYetToStart
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : isDelayed
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : isEarly
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          }`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isReached ? "bg-cyan-400" : isDelayed ? "bg-rose-400" : "bg-emerald-400"
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isReached ? "bg-cyan-500" : isDelayed ? "bg-rose-500" : "bg-emerald-500"
              }`} />
            </span>
            <span>{data.status_label}</span>
          </div>
        </div>
      </div>

      {/* Visual Journey Progress Bar */}
      <div className="my-6">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{data.source_code}</span>
          </div>
          <div className="text-emerald-400 font-semibold">
            {data.distance_covered_km} / {data.total_distance_km} km ({data.progress_percent}%)
          </div>
          <div className="flex items-center gap-1.5">
            <span>{data.destination_code}</span>
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          </div>
        </div>

        {/* Progress Track */}
        <div className="relative h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.max(2, data.progress_percent)}%` }}
          />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Current Station / Section */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Current Position</span>
          </div>
          <div className="text-base font-bold text-white truncate">
            {data.current_station_name || "En Route"}
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            {data.current_station_code ? `Code: ${data.current_station_code}` : "Sectional transit"}
          </div>
        </div>

        {/* Card 2: Next Halt */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next Stoppage</span>
          </div>
          <div className="text-base font-bold text-white truncate">
            {data.upcoming_halt_name || (isReached ? "Arrived" : "Final Destination")}
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            {data.upcoming_halt_distance_km !== undefined ? `~${data.upcoming_halt_distance_km} km away` : "Arriving soon"}
          </div>
        </div>

        {/* Card 3: Delay status */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Current Delay</span>
          </div>
          <div className={`text-base font-bold ${
            data.delay_minutes > 15 ? "text-rose-400" : data.delay_minutes > 0 ? "text-amber-400" : "text-emerald-400"
          }`}>
            {data.delay_minutes > 0 ? `+${data.delay_minutes} minutes` : data.delay_minutes < 0 ? `${data.delay_minutes} min (Early)` : "Right On Time"}
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            Updated: {data.last_updated_time || "Live"}
          </div>
        </div>

        {/* Card 4: Speed & Stoppages */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1">
            <Gauge className="w-3.5 h-3.5 text-purple-400" />
            <span>Speed & Halts</span>
          </div>
          <div className="text-base font-bold text-white">
            {data.average_speed_kmph ? `${data.average_speed_kmph} km/h` : "Cruise Speed"}
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            {data.commercial_stops_count} Halts ({data.total_stations_count} Points)
          </div>
        </div>
      </div>

      {/* Live Status Events Feed */}
      {data.live_events && data.live_events.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-slate-800/80">
          <div className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Telemetry Log:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.live_events.map((ev, i) => (
              <div
                key={i}
                className="px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{ev.message || ev.readable_message}</span>
                {ev.hint && (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    {ev.hint}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
