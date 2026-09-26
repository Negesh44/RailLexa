export interface StationEvent {
  station_code: string;
  station_name: string;
  state_name: string;
  distance_from_source_km: number;
  scheduled_arrival: string;
  scheduled_departure: string;
  actual_arrival?: string;
  actual_departure?: string;
  delay_arrival_min: number;
  delay_departure_min: number;
  platform: string | number;
  is_commercial_stop: boolean;
  day: number;
  has_arrived: boolean;
  has_departed: boolean;
  is_current_station: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface LiveLocationDetail {
  type: number;
  message: string;
  readable_message: string;
  label?: string;
  hint?: string;
}

export interface LiveTrainResponse {
  success: boolean;
  train_number: string;
  train_name: string;
  source: string;
  source_code: string;
  destination: string;
  destination_code: string;
  start_date: string;
  day_offset: number;
  status: "RUNNING" | "ON_TIME" | "DELAYED" | "YET_TO_START" | "REACHED_DESTINATION" | "INCORRECT_DAY";
  status_label: string;
  status_summary: string;
  delay_minutes: number;
  current_station_name: string;
  current_station_code: string;
  last_updated_time?: string;
  average_speed_kmph?: number;
  distance_covered_km: number;
  total_distance_km: number;
  progress_percent: number;
  upcoming_halt_name?: string;
  upcoming_halt_distance_km?: number;
  live_events: LiveLocationDetail[];
  total_stations_count: number;
  commercial_stops_count: number;
  stations: StationEvent[];
  cached?: boolean;
  cached_at?: string;
  source_repo_credit: {
    engine: string;
    github_references: string[];
  };
}

export interface PopularTrain {
  number: string;
  name: string;
  type: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureTime: string;
  arrivalTime: string;
  distanceKm: number;
  duration: string;
  runsOn: string[];
}
