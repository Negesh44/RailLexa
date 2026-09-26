import React, { useState } from "react";
import { 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  Play, 
  Code2, 
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Server
} from "lucide-react";
import { LiveTrainResponse } from "../types";

interface ApiConsoleProps {
  trainNumber: string;
  dayOffset: number;
  liveData: LiveTrainResponse | null;
  isLoading: boolean;
  onExecute: () => void;
}

export const ApiConsole: React.FC<ApiConsoleProps> = ({
  trainNumber,
  dayOffset,
  liveData,
  isLoading,
  onExecute,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<"curl" | "javascript" | "python" | "node" | "go">("curl");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const endpointPath = `/api/train/${trainNumber}/live?day=${dayOffset}${upcomingOnly ? "&upcoming_only=true" : ""}`;
  const fullUrl = `${origin}${endpointPath}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getCodeSnippet = () => {
    switch (selectedLanguage) {
      case "curl":
        return `curl -X GET "${fullUrl}" \\
  -H "Accept: application/json"`;

      case "javascript":
        return `// Browser or Frontend JS
async function getLiveTrainStatus() {
  const res = await fetch("${fullUrl}", {
    headers: { "Accept": "application/json" }
  });
  const data = await res.json();
  console.log("Train:", data.train_name);
  console.log("Current Status:", data.status_summary);
  console.log("Delay (mins):", data.delay_minutes);
  return data;
}

getLiveTrainStatus();`;

      case "python":
        return `# Python (inspired by Arkapravo-Ghosh/TrainTrack)
import requests

url = "${fullUrl}"
headers = {"Accept": "application/json"}

try:
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    data = response.json()
    
    print(f"Train: {data['train_number']} - {data['train_name']}")
    print(f"Status: {data['status_label']} ({data['status_summary']})")
    print(f"Current Position: {data['current_station_name']} ({data['current_station_code']})")
    print(f"Delay: {data['delay_minutes']} minutes")
except requests.exceptions.RequestException as e:
    print(f"API Error: {e}")`;

      case "node":
        return `// Node.js (v18+)
import https from "node:https";

const url = "${fullUrl}";

const res = await fetch(url, { headers: { "Accept": "application/json" } });
const status = await res.json();

console.log("Train Live Status:", {
  train: status.train_name,
  position: status.current_station_name,
  delay: status.delay_minutes,
  progress: status.progress_percent + "%"
});`;

      case "go":
        return `// Golang
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	resp, err := http.Get("${fullUrl}")
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	fmt.Println("Train:", result["train_name"])
	fmt.Println("Delay:", result["delay_minutes"])
}`;
    }
  };

  return (
    <div id="api-playground" className="w-full space-y-6">
      {/* Interactive URL Bar & Request Runner */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Live Endpoint Execution Bar</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              REST GET
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={upcomingOnly}
                onChange={(e) => setUpcomingOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
              />
              <span>upcoming_only</span>
            </label>
          </div>
        </div>

        {/* URL Input with Send Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-mono font-extrabold text-xs rounded-lg self-start sm:self-auto">
            GET
          </span>
          <div className="flex-1 font-mono text-xs text-slate-300 overflow-x-auto whitespace-nowrap py-1 px-1">
            <span className="text-slate-500">{origin}</span>
            <span className="text-emerald-400 font-semibold">{endpointPath}</span>
          </div>
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              id="copy-endpoint-btn"
              onClick={() => copyToClipboard(fullUrl, "url")}
              className="p-2 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded-lg transition-colors border border-slate-800"
              title="Copy URL"
            >
              {copiedText === "url" ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <a
              id="open-endpoint-link"
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded-lg transition-colors border border-slate-800"
              title="Open raw JSON in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              id="send-request-btn"
              onClick={onExecute}
              disabled={isLoading}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-500/30"
            >
              <Play className={`w-3.5 h-3.5 fill-slate-950 ${isLoading ? "animate-pulse" : ""}`} />
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* Response Metadata Badges */}
        <div className="mt-3 flex items-center gap-3 text-xs font-mono text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-slate-200 font-semibold">Status: 200 OK</span>
          </div>
          <span className="text-slate-700">•</span>
          <div>Format: <span className="text-slate-300">application/json</span></div>
          <span className="text-slate-700">•</span>
          <div>Engine: <span className="text-slate-300 font-semibold">NTES / RailYatri Extractor</span></div>
          {liveData?.cached && (
            <>
              <span className="text-slate-700">•</span>
              <div className="text-cyan-400 font-medium">⚡ Cached (45s TTL)</div>
            </>
          )}
        </div>
      </div>

      {/* Code Snippets & JSON Response side-by-side or stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Code Generator */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Client Code Generator</h3>
            </div>
            <button
              onClick={() => copyToClipboard(getCodeSnippet(), "code")}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-mono py-1 px-2 rounded-lg bg-slate-950 border border-slate-800 transition-colors"
            >
              {copiedText === "code" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Language Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-3 overflow-x-auto">
            {(["curl", "javascript", "python", "node", "go"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                  selectedLanguage === lang
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {lang === "curl"
                  ? "cURL"
                  : lang === "javascript"
                  ? "JS (Fetch)"
                  : lang === "python"
                  ? "Python"
                  : lang === "node"
                  ? "Node.js"
                  : "Go"}
              </button>
            ))}
          </div>

          {/* Code Block Display */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre className="text-emerald-300 leading-relaxed whitespace-pre font-mono">
              <code>{getCodeSnippet()}</code>
            </pre>
          </div>
        </div>

        {/* Right Column: Live JSON Payload */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Live JSON Response Payload</h3>
            </div>
            <button
              onClick={() => copyToClipboard(JSON.stringify(liveData, null, 2), "json")}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-mono py-1 px-2 rounded-lg bg-slate-950 border border-slate-800 transition-colors"
            >
              {copiedText === "json" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          {/* Formatted JSON Box */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs overflow-y-auto max-h-[420px]">
            {liveData ? (
              <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap break-all">
                <code>
                  {JSON.stringify(
                    {
                      success: liveData.success,
                      train_number: liveData.train_number,
                      train_name: liveData.train_name,
                      status: liveData.status,
                      status_label: liveData.status_label,
                      delay_minutes: liveData.delay_minutes,
                      current_station_name: liveData.current_station_name,
                      current_station_code: liveData.current_station_code,
                      upcoming_halt_name: liveData.upcoming_halt_name,
                      distance_covered_km: liveData.distance_covered_km,
                      total_distance_km: liveData.total_distance_km,
                      progress_percent: liveData.progress_percent,
                      live_events: liveData.live_events,
                      stations_preview: liveData.stations.slice(0, 3).map((s) => ({
                        code: s.station_code,
                        name: s.station_name,
                        platform: s.platform,
                        scheduled_arrival: s.scheduled_arrival,
                        actual_arrival: s.actual_arrival,
                        delay_min: s.delay_arrival_min,
                        is_current: s.is_current_station,
                      })),
                      total_stations: liveData.total_stations_count,
                      source_repo_credit: liveData.source_repo_credit,
                    },
                    null,
                    2
                  )}
                </code>
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono py-12">
                Click "Send" above to inspect response
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
