import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fetchLiveTrainStatus, searchLocalTrains } from "./server/scraper";
import { POPULAR_TRAINS } from "./server/popularTrains";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON middleware
  app.use(express.json());

  // CORS and developer API convenience headers
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.setHeader("X-API-Engine", "RailTrack-Live-API-v1");
    res.setHeader("X-Extracted-From", "GitHub:Arkapravo-Ghosh/TrainTrack & chandrkant/railyatri.api");
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  // 1. Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      service: "RailTrack Indian Railways Live Train Running Status API",
      version: "1.0.0",
      upstream_sources: [
        "National Train Enquiry System (NTES)",
        "RailYatri Live Telemetry",
        "eRail Train Schedules"
      ],
      attribution: {
        train_track: "https://github.com/Arkapravo-Ghosh/TrainTrack",
        railyatri_api: "https://github.com/chandrkant/railyatri.api",
        railkit: "https://github.com/RAJIV81205/RailKit"
      }
    });
  });

  // 2. Popular trains endpoint
  app.get("/api/popular", (req, res) => {
    res.json({
      success: true,
      count: POPULAR_TRAINS.length,
      trains: POPULAR_TRAINS
    });
  });

  // 3. Search trains endpoint
  app.get("/api/trains/search", (req, res) => {
    const query = (req.query.q as string) || "";
    const results = searchLocalTrains(query);
    res.json({
      success: true,
      query,
      count: results.length,
      trains: results
    });
  });

  // 4. Primary Live Running Status endpoint
  // GET /api/train/:trainNumber/live?day=0&upcoming_only=false
  app.get("/api/train/:trainNumber/live", async (req, res) => {
    const { trainNumber } = req.params;
    const startDay = req.query.day !== undefined ? parseInt(req.query.day as string, 10) : 0;
    const upcomingOnly = req.query.upcoming_only === "true";

    const cleanDay = isNaN(startDay) ? 0 : Math.max(0, Math.min(2, startDay));

    try {
      const liveData = await fetchLiveTrainStatus(trainNumber, cleanDay, upcomingOnly);
      res.setHeader("Cache-Control", "public, max-age=30");
      res.json(liveData);
    } catch (err: any) {
      console.error("API error fetching train live status:", err.message);
      res.status(400).json({
        success: false,
        error: err.message || "Failed to retrieve train running status",
        train_number: trainNumber,
        hint: "Please ensure the train number is a valid 4 or 5 digit Indian Railways train."
      });
    }
  });

  // 5. Train Schedule / Timetable endpoint
  // GET /api/train/:trainNumber/schedule
  app.get("/api/train/:trainNumber/schedule", async (req, res) => {
    const { trainNumber } = req.params;
    try {
      const data = await fetchLiveTrainStatus(trainNumber, 0, false);
      res.json({
        success: true,
        train_number: data.train_number,
        train_name: data.train_name,
        source: data.source,
        source_code: data.source_code,
        destination: data.destination,
        destination_code: data.destination_code,
        total_distance_km: data.total_distance_km,
        commercial_stops_count: data.commercial_stops_count,
        total_stops_count: data.total_stations_count,
        schedule: data.stations.map(st => ({
          station_code: st.station_code,
          station_name: st.station_name,
          state: st.state_name,
          scheduled_arrival: st.scheduled_arrival,
          scheduled_departure: st.scheduled_departure,
          platform: st.platform,
          distance_from_source_km: st.distance_from_source_km,
          is_commercial_stop: st.is_commercial_stop,
          day: st.day
        }))
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || "Could not retrieve schedule"
      });
    }
  });

  // 6. OpenAPI 3.0 Documentation Spec
  app.get("/api/docs/spec", (req, res) => {
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol || "http";
    res.json({
      openapi: "3.0.0",
      info: {
        title: "RailTrack Indian Railways Live Train Running Status API",
        version: "1.0.0",
        description: "High-performance REST API extracting live Indian Railways train running status, GPS position, delays, platform numbers, and route events. Powered by open-source scrapers and extractors.",
        contact: {
          name: "Open Source RailTrack API",
          reference: "Based on GitHub: Arkapravo-Ghosh/TrainTrack & chandrkant/railyatri.api"
        }
      },
      servers: [
        {
          url: `${protocol}://${host}`,
          description: "Current Live Server"
        }
      ],
      paths: {
        "/api/train/{trainNumber}/live": {
          get: {
            summary: "Get Live Train Running Status",
            description: "Fetches live train position, current delay in minutes, speed, and real-time station-by-station itinerary.",
            parameters: [
              {
                name: "trainNumber",
                in: "path",
                required: true,
                description: "5-digit Indian Railways train number (e.g., 12951, 12625, 12301)",
                schema: { type: "string", example: "12951" }
              },
              {
                name: "day",
                in: "query",
                required: false,
                description: "Journey start day offset: 0 for Today, 1 for Yesterday, 2 for Day Before Yesterday",
                schema: { type: "integer", default: 0, enum: [0, 1, 2] }
              },
              {
                name: "upcoming_only",
                in: "query",
                required: false,
                description: "Filter stations array to only include current and upcoming stations",
                schema: { type: "boolean", default: false }
              }
            ],
            responses: {
              "200": {
                description: "Live train running status details",
                content: { "application/json": { schema: { type: "object" } } }
              },
              "400": {
                description: "Invalid train number or request parameters"
              }
            }
          }
        },
        "/api/train/{trainNumber}/schedule": {
          get: {
            summary: "Get Train Timetable & Route",
            description: "Returns the static timetable and halts with distance and platform details.",
            parameters: [
              {
                name: "trainNumber",
                in: "path",
                required: true,
                schema: { type: "string", example: "12951" }
              }
            ],
            responses: {
              "200": { description: "Timetable data" }
            }
          }
        },
        "/api/trains/search": {
          get: {
            summary: "Search Trains",
            description: "Search Indian Railways trains by number, name, or station code.",
            parameters: [
              {
                name: "q",
                in: "query",
                required: true,
                schema: { type: "string", example: "Rajdhani" }
              }
            ]
          }
        },
        "/api/popular": {
          get: {
            summary: "List Popular Trains",
            description: "Returns a curated list of high-traffic express and rajdhani trains."
          }
        },
        "/api/health": {
          get: {
            summary: "API Health Check",
            description: "Returns API operational status and attribution information."
          }
        }
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RailTrack Live API Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
