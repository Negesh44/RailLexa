import React, { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Filter, 
  Search, 
  ArrowDownCircle, 
  Layers,
  Radio
} from "lucide-react";
import { StationEvent } from "../types";

interface StationTimelineProps {
  stations: StationEvent[];
  currentStationCode?: string;
  totalDistanceKm: number;
}

export const StationTimeline: React.FC<StationTimelineProps> = ({
  stations,
  currentStationCode,
  totalDistanceKm,
}) => {
  const [commercialOnly, setCommercialOnly] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (commercialOnly && !s.is_commercial_stop) return false;
      if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase();
        return (
          s.station_name.toLowerCase().includes(q) ||
          s.station_code.toLowerCase().includes(q) ||
          s.state_name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [stations, commercialOnly, filterQuery]);

  return (
    <div id="station-timeline-card" className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Route & Station Itinerary</span>
            <span className="text-xs font-mono font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {filteredStations.length} of {stations.length} Points
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time schedule tracking with platform assignments and delay metrics
          </p>
        </div>

        {/* Filter & View Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Station search in route */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Find station..."
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-emerald-500 w-36 sm:w-44"
            />
          </div>

          {/* Commercial stops toggle */}
          <button
            onClick={() => setCommercialOnly(!commercialOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              commercialOnly
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>{commercialOnly ? "Halts Only" : "All Points"}</span>
          </button>
        </div>
      </div>

      {/* Stations List Table / Timeline */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <th className="py-2.5 pl-3 pr-2 w-8">Status</th>
              <th className="py-2.5 px-3">Station</th>
              <th className="py-2.5 px-3">Distance</th>
              <th className="py-2.5 px-3">Platform</th>
              <th className="py-2.5 px-3">Schedule (STA / STD)</th>
              <th className="py-2.5 px-3">Actual / ETA</th>
              <th className="py-2.5 px-3 pr-3 text-right">Delay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredStations.map((st, idx) => {
              const isCurrent = st.is_current_station;
              const hasDeparted = st.has_departed;
              const hasArrived = st.has_arrived;
              const delay = st.delay_arrival_min || 0;

              return (
                <tr
                  key={`${st.station_code}-${idx}`}
                  className={`group transition-colors ${
                    isCurrent
                      ? "bg-emerald-500/10 text-white font-semibold"
                      : "hover:bg-slate-800/40 text-slate-300"
                  }`}
                >
                  {/* Status Indicator Icon */}
                  <td className="py-3 pl-3 pr-2">
                    {isCurrent ? (
                      <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75" />
                        <Radio className="w-4 h-4 text-emerald-400 relative" />
                      </div>
                    ) : hasDeparted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500/80" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700 group-hover:bg-slate-500 mx-auto" />
                    )}
                  </td>

                  {/* Station Name & Code */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {st.station_name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {st.station_code}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-extrabold tracking-wide">
                          Current Stop
                        </span>
                      )}
                    </div>
                    {st.state_name && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {st.state_name} • Day {st.day}
                      </div>
                    )}
                  </td>

                  {/* Distance */}
                  <td className="py-3 px-3 text-slate-400">
                    {st.distance_from_source_km} km
                  </td>

                  {/* Platform */}
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      PF #{st.platform ?? "--"}
                    </span>
                  </td>

                  {/* Scheduled Times */}
                  <td className="py-3 px-3 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">{st.scheduled_arrival}</span>
                      <span className="text-slate-600">/</span>
                      <span className="font-semibold text-slate-200">{st.scheduled_departure}</span>
                    </div>
                  </td>

                  {/* Actual / ETA */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className={delay > 5 ? "text-amber-400" : "text-emerald-400"}>
                        {st.actual_arrival || st.scheduled_arrival}
                      </span>
                      <span className="text-slate-600">/</span>
                      <span className={delay > 5 ? "text-amber-400" : "text-emerald-400"}>
                        {st.actual_departure || st.scheduled_departure}
                      </span>
                    </div>
                  </td>

                  {/* Delay Pill */}
                  <td className="py-3 px-3 pr-3 text-right">
                    {delay > 5 ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[11px]">
                        +{delay}m
                      </span>
                    ) : delay < -3 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
                        {delay}m (Early)
                      </span>
                    ) : (
                      <span className="text-emerald-400 text-[11px]">
                        On Time
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
