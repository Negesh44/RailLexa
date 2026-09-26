import React, { useState } from "react";
import { 
  BookOpen, 
  Terminal, 
  Cpu, 
  CheckCircle, 
  ArrowRight, 
  Copy, 
  Check, 
  Github, 
  ExternalLink,
  Layers,
  Radio,
  FileText
} from "lucide-react";

export const ApiDocumentation: React.FC = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      id: "live-status",
      method: "GET",
      path: "/api/train/:trainNumber/live",
      title: "Get Live Train Running Status",
      description: "Extracts real-time Indian Railways live train status, current station, minutes delay, speed, and upcoming halts.",
      params: [
        { name: "trainNumber", type: "string (path)", required: true, description: "5-digit Indian Railways train number (e.g., 12951, 12625, 12301)" },
        { name: "day", type: "number (query)", required: false, description: "Departure offset: 0 for today, 1 for yesterday, 2 for day before yesterday. Defaults to 0." },
        { name: "upcoming_only", type: "boolean (query)", required: false, description: "Filter the stations array to only include current and upcoming stations. Defaults to false." }
      ],
      sampleResponse: `{
  "success": true,
  "train_number": "12625",
  "train_name": "Kerala SF Express",
  "source": "TRIVANDRUM CENTRAL",
  "source_code": "TVC",
  "destination": "NEW DELHI",
  "destination_code": "NDLS",
  "start_date": "2026-09-14",
  "day_offset": 2,
  "status": "DELAYED",
  "status_label": "Delayed by 14m",
  "status_summary": "Crossed AJHAI at 11:25",
  "delay_minutes": 14,
  "current_station_name": "AJHAI",
  "current_station_code": "AJH",
  "last_updated_time": "2026-09-16 11:27:00",
  "average_speed_kmph": 82,
  "distance_covered_km": 2921,
  "total_distance_km": 3040,
  "progress_percent": 96,
  "upcoming_halt_name": "DELHI HAZRAT NIZAMUDDIN (NZM)",
  "upcoming_halt_distance_km": 112,
  "live_events": [
    {
      "type": 1,
      "message": "Crossed AJHAI at 11:25",
      "hint": "Delay 14m"
    }
  ],
  "stations": [ ... ]
}`
    },
    {
      id: "schedule",
      method: "GET",
      path: "/api/train/:trainNumber/schedule",
      title: "Get Train Timetable & Halts",
      description: "Returns the official scheduled timetable with all commercial halts, platform assignments, and distances.",
      params: [
        { name: "trainNumber", type: "string (path)", required: true, description: "5-digit train number (e.g. 12951)" }
      ],
      sampleResponse: `{
  "success": true,
  "train_number": "12951",
  "train_name": "Mumbai Central - New Delhi Rajdhani Express",
  "source": "MUMBAI CENTRAL",
  "source_code": "MMCT",
  "destination": "NEW DELHI",
  "destination_code": "NDLS",
  "total_distance_km": 1384,
  "commercial_stops_count": 8,
  "schedule": [
    {
      "station_code": "MMCT",
      "station_name": "MUMBAI CENTRAL",
      "scheduled_arrival": "--",
      "scheduled_departure": "17:00",
      "platform": 1,
      "distance_from_source_km": 0,
      "day": 1
    }
  ]
}`
    },
    {
      id: "search",
      method: "GET",
      path: "/api/trains/search?q=:query",
      title: "Search Trains by Number / Name",
      description: "Search popular Indian Railways trains by number, name, or station codes.",
      params: [
        { name: "q", type: "string (query)", required: true, description: "Search query (e.g. 'Rajdhani', '12951', 'Vande Bharat', 'NDLS')" }
      ],
      sampleResponse: `{
  "success": true,
  "query": "Rajdhani",
  "count": 4,
  "trains": [ ... ]
}`
    },
    {
      id: "health",
      method: "GET",
      path: "/api/health",
      title: "API Status & Upstream Health",
      description: "Returns the health of the live extractor and open-source references.",
      params: [],
      sampleResponse: `{
  "status": "ok",
  "uptime_seconds": 320,
  "service": "RailTrack Indian Railways Live Train Running Status API",
  "upstream_sources": [
    "National Train Enquiry System (NTES)",
    "RailYatri Live Telemetry",
    "eRail Train Schedules"
  ]
}`
    }
  ];

  return (
    <div id="api-docs-container" className="w-full space-y-8">
      {/* Overview & GitHub Extraction Architecture Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-3">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            RailTrack Live API Reference
          </h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-4xl">
          This API extracts live running status, real-time GPS telemetry, station arrival/departure delays, and platform assignments for trains running across the Indian Railways network.
        </p>

        {/* GitHub Attribution Box */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Extracted From GitHub Repositories
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Open-Source Indian Railways Scrapers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <a
              href="https://github.com/Arkapravo-Ghosh/TrainTrack"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-slate-800/90 transition-all flex items-start gap-3 group"
            >
              <Terminal className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 group-hover:text-emerald-400">
                  <span>Arkapravo-Ghosh/TrainTrack</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  FastAPI wrapper parsing National Train Enquiry System (NTES) running status and HTML events.
                </p>
              </div>
            </a>

            <a
              href="https://github.com/chandrkant/railyatri.api"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-slate-800/90 transition-all flex items-start gap-3 group"
            >
              <Radio className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 group-hover:text-cyan-400">
                  <span>chandrkant/railyatri.api & RAJIV81205/RailKit</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Real-time live train tracking engine extracting GPS positions, delays, and dynamic station halts.
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Endpoints Detailed List */}
      <div className="space-y-6">
        {endpoints.map((ep) => (
          <div
            key={ep.id}
            id={`doc-${ep.id}`}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-mono font-extrabold text-xs rounded-lg">
                    {ep.method}
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-slate-200">
                    {ep.path}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5">{ep.title}</h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">{ep.description}</p>
              </div>

              <button
                onClick={() => copyText(ep.path, ep.id)}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-mono transition-colors"
              >
                {copiedEndpoint === ep.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Path</span>
                  </>
                )}
              </button>
            </div>

            {/* Parameters Table */}
            {ep.params.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs uppercase font-mono font-bold text-slate-400 mb-2">Parameters</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500">
                        <th className="py-2 px-2">Field</th>
                        <th className="py-2 px-2">Type</th>
                        <th className="py-2 px-2">Required</th>
                        <th className="py-2 px-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {ep.params.map((p, idx) => (
                        <tr key={idx} className="text-slate-300">
                          <td className="py-2 px-2 font-bold text-emerald-400">{p.name}</td>
                          <td className="py-2 px-2 text-slate-400">{p.type}</td>
                          <td className="py-2 px-2">
                            {p.required ? (
                              <span className="text-rose-400 font-semibold">Yes</span>
                            ) : (
                              <span className="text-slate-500">Optional</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-slate-300">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Response Preview */}
            <div>
              <h4 className="text-xs uppercase font-mono font-bold text-slate-400 mb-2">Sample JSON Response</h4>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-300 overflow-x-auto max-h-72 overflow-y-auto">
                <pre className="text-emerald-300 leading-relaxed whitespace-pre font-mono">
                  <code>{ep.sampleResponse}</code>
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
