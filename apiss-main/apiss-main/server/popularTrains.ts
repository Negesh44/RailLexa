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

export const POPULAR_TRAINS: PopularTrain[] = [
  {
    number: "12951",
    name: "Mumbai Central - New Delhi Tejas Rajdhani Express",
    type: "Rajdhani / Tejas",
    from: "Mumbai Central",
    fromCode: "MMCT",
    to: "New Delhi",
    toCode: "NDLS",
    departureTime: "17:00",
    arrivalTime: "08:32",
    distanceKm: 1384,
    duration: "15h 32m",
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    number: "12952",
    name: "New Delhi - Mumbai Central Tejas Rajdhani Express",
    type: "Rajdhani / Tejas",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Mumbai Central",
    toCode: "MMCT",
    departureTime: "16:55",
    arrivalTime: "08:35",
    distanceKm: 1384,
    duration: "15h 40m",
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    number: "12625",
    name: "Kerala Superfast Express",
    type: "Superfast Express",
    from: "Thiruvananthapuram Central",
    fromCode: "TVC",
    to: "New Delhi",
    toCode: "NDLS",
    departureTime: "12:15",
    arrivalTime: "13:40",
    distanceKm: 3031,
    duration: "49h 25m",
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    number: "12626",
    name: "Kerala Superfast Express (Return)",
    type: "Superfast Express",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Thiruvananthapuram Central",
    toCode: "TVC",
    departureTime: "20:10",
    arrivalTime: "21:50",
    distanceKm: 3031,
    duration: "49h 40m",
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    number: "12301",
    name: "Howrah - New Delhi Rajdhani Express (Via Gaya)",
    type: "Rajdhani Express",
    from: "Howrah Jn",
    fromCode: "HWH",
    to: "New Delhi",
    toCode: "NDLS",
    departureTime: "16:50",
    arrivalTime: "10:05",
    distanceKm: 1451,
    duration: "17h 15m",
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  },
  {
    number: "12302",
    name: "New Delhi - Howrah Rajdhani Express (Via Gaya)",
    type: "Rajdhani Express",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Howrah Jn",
    toCode: "HWH",
    departureTime: "16:50",
    arrivalTime: "09:55",
    distanceKm: 1451,
    duration: "17h 05m",
    runsOn: ["Sun", "Mon", "Tue", "Wed", "Thu", "Sat"]
  },
  {
    number: "22436",
    name: "Vande Bharat Express (New Delhi - Varanasi)",
    type: "Vande Bharat",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Varanasi Jn",
    toCode: "BSB",
    departureTime: "06:00",
    arrivalTime: "14:00",
    distanceKm: 759,
    duration: "8h 00m",
    runsOn: ["Sun", "Tue", "Wed", "Fri", "Sat"]
  },
  {
    number: "12002",
    name: "Bhopal Shatabdi Express",
    type: "Shatabdi Express",
    from: "New Delhi",
    fromCode: "NDLS",
    to: "Rani Kamalapati (Bhopal)",
    toCode: "RKMP",
    departureTime: "06:00",
    arrivalTime: "14:40",
    distanceKm: 708,
    duration: "8h 40m",
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    number: "12138",
    name: "Punjab Mail",
    type: "Mail / Express",
    from: "Firozpur Cantt",
    fromCode: "FZR",
    to: "Mumbai CSMT",
    toCode: "CSMT",
    departureTime: "21:45",
    arrivalTime: "07:35",
    distanceKm: 1930,
    duration: "33h 50m",
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    number: "12296",
    name: "Sanghamitra Superfast Express",
    type: "Superfast Express",
    from: "Danapur (Patna)",
    fromCode: "DNR",
    to: "SMVT Bengaluru",
    toCode: "SMVB",
    departureTime: "20:15",
    arrivalTime: "16:10",
    distanceKm: 2697,
    duration: "43h 55m",
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    number: "12801",
    name: "Purushottam Express",
    type: "Superfast Express",
    from: "Puri",
    fromCode: "PURI",
    to: "New Delhi",
    toCode: "NDLS",
    departureTime: "21:55",
    arrivalTime: "04:00",
    distanceKm: 1864,
    duration: "30h 05m",
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  {
    number: "12621",
    name: "Tamil Nadu Express",
    type: "Superfast Express",
    from: "MGR Chennai Central",
    fromCode: "MAS",
    to: "New Delhi",
    toCode: "NDLS",
    departureTime: "22:00",
    arrivalTime: "06:30",
    distanceKm: 2182,
    duration: "32h 30m",
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  }
];
