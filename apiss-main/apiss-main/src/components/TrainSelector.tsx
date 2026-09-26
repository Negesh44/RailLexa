import React, { useState, useEffect } from "react";
import { Search, RotateCw, Calendar, Sparkles, AlertCircle } from "lucide-react";
import { PopularTrain } from "../types";

interface TrainSelectorProps {
  currentTrainNumber: string;
  onSelectTrain: (trainNumber: string) => void;
  dayOffset: number;
  onSelectDay: (day: number) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const TrainSelector: React.FC<TrainSelectorProps> = ({
  currentTrainNumber,
  onSelectTrain,
  dayOffset,
  onSelectDay,
  isLoading,
  onRefresh,
}) => {
  const [query, setQuery] = useState(currentTrainNumber);
  const [popularTrains, setPopularTrains] = useState<PopularTrain[]>([]);
  const [suggestions, setSuggestions] = useState<PopularTrain[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetch("/api/popular")
      .then((res) => res.json())
      .then((data) => {
        if (data.trains) {
          setPopularTrains(data.trains);
        }
      })
      .catch((err) => console.error("Could not fetch popular trains", err));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().replace(/\D/g, "");
    if (clean) {
      onSelectTrain(clean);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (val: string) => {
    setQuery(val);
    const q = val.trim().toLowerCase();
    if (q.length > 0 && popularTrains.length > 0) {
      const filtered = popularTrains.filter(
        (t) =>
          t.number.includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.from.toLowerCase().includes(q) ||
          t.to.toLowerCase().includes(q) ||
          t.fromCode.toLowerCase().includes(q) ||
          t.toCode.toLowerCase().includes(q)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectTrainNumber = (num: string) => {
    setQuery(num);
    onSelectTrain(num);
    setShowSuggestions(false);
  };

  return (
    <div id="train-selector-card" className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/20">
      {/* Top Search & Actions Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input Form */}
        <div className="relative flex-1">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-emerald-400" />
            </div>
            <input
              id="train-search-input"
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (query.trim() && popularTrains.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder="Enter 5-digit train number or name (e.g. 12951, 12625, Rajdhani)..."
              className="w-full pl-10 pr-24 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-all"
            />
            <button
              id="train-track-btn"
              type="submit"
              disabled={isLoading}
              className="absolute right-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-500/30"
            >
              <span>Track</span>
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-800/80">
              {suggestions.map((train) => (
                <button
                  key={train.number}
                  onClick={() => selectTrainNumber(train.number)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-900 transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">
                        {train.number}
                      </span>
                      <span className="text-xs text-slate-300 font-medium truncate">
                        {train.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>{train.from} ({train.fromCode})</span>
                      <span>→</span>
                      <span>{train.to} ({train.toCode})</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                    {train.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Journey Day Selector & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Departed:</span>
            </span>
            <button
              id="day-btn-today"
              onClick={() => onSelectDay(0)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                dayOffset === 0
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Today
            </button>
            <button
              id="day-btn-yesterday"
              onClick={() => onSelectDay(1)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                dayOffset === 1
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Yesterday
            </button>
            <button
              id="day-btn-2days"
              onClick={() => onSelectDay(2)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                dayOffset === 2
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              -2 Days
            </button>
          </div>

          {/* Refresh Button */}
          <button
            id="refresh-status-btn"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-emerald-400 border border-slate-800 rounded-xl transition-all"
            title="Refresh Live Telemetry"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Quick Select Popular Trains Pills */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Live Examples:</span>
        </span>
        {popularTrains.slice(0, 6).map((train) => {
          const isSelected = currentTrainNumber === train.number;
          return (
            <button
              key={train.number}
              onClick={() => selectTrainNumber(train.number)}
              className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
                  : "bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80"
              }`}
            >
              <span className="font-bold">{train.number}</span>
              <span className="text-[11px] opacity-75 hidden sm:inline truncate max-w-[120px]">
                {train.fromCode} → {train.toCode}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
