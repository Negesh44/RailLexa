// Hardcoded real railway operational accounts — Chennai Division (Southern Railway - MAS)
// Role Separation: Chief Traffic Controller (MAS Zonal HQ) & Department Field Engineers

export const USER_ROLES = {
  CONTROLLER: 'CONTROLLER',
  DEPARTMENT: 'DEPARTMENT'
};

export const DEPARTMENTS = {
  TRACK_ENG: {
    id: 'TRACK_ENG',
    name: 'Civil & Track Engineering (MAS P-Way)',
    shortName: 'Track Eng (MAS)',
    icon: 'Hammer',
    badgeColor: 'emerald',
    description: '130 km/h Track ballast tamping, USFD rail testing, turnout renewals & alignment'
  },
  SIGNAL_TELECOM: {
    id: 'SIGNAL_TELECOM',
    name: 'Signal & Telecom (S&T MAS)',
    shortName: 'S&T (MAS)',
    icon: 'Radio',
    badgeColor: 'cyan',
    description: 'Electronic switch point machines, digital axle counters (MSDAC) & automatic block signaling'
  },
  ELECTRICAL_OHE: {
    id: 'ELECTRICAL_OHE',
    name: 'Overhead Electrical Traction (OHE MAS)',
    shortName: 'OHE / Traction (MAS)',
    icon: 'Zap',
    badgeColor: 'amber',
    description: '25kV AC overhead catenary wire inspection, cantilever adjustment & power isolation blocks'
  },
  MECHANICAL: {
    id: 'MECHANICAL',
    name: 'Mechanical Coaching Depot (BBQ Yard)',
    shortName: 'Mechanical (BBQ)',
    icon: 'Cog',
    badgeColor: 'purple',
    description: 'Basin Bridge pit-line maintenance, express rake inspection & breakdown crane operations'
  }
};

export const ACCOUNTS = [
  // --- CHIEF TRAFFIC CONTROLLER ACCOUNT (CHENNAI DIVISION) ---
  {
    id: 'ctrl-01',
    userId: 'controller@railways.gov.in',
    username: 'CTRL_CHENNAI_MAS',
    password: 'ctrl123',
    name: 'Shri R. Krishnaswamy',
    designation: 'Chief Section Controller (Traffic)',
    division: 'Chennai Division (Southern Railway - MAS HQ)',
    role: USER_ROLES.CONTROLLER,
    departmentId: null,
    avatar: '👨‍✈️',
    permissions: [
      'APPROVE_BLOCKS',
      'REJECT_BLOCKS',
      'RESCHEDULE_BLOCKS',
      'RUN_AI_OPTIMIZER',
      'SIMULATE_TRAFFIC_CONFLICTS',
      'EMERGENCY_TRACK_REVOCATION',
      'VIEW_LIVE_TRAIN_POSITIONS',
      'MONITOR_CORRIDOR_AVAILABILITY'
    ]
  },

  // --- DEPARTMENT FIELD ENGINEER ACCOUNTS (CHENNAI DIVISION) ---
  {
    id: 'dept-track-01',
    userId: 'track.eng@railways.gov.in',
    username: 'ENG_MAS_AJJ_01',
    password: 'track123',
    name: 'Er. K. Ramanathan',
    designation: 'Senior Section Engineer (P-Way / Track MAS)',
    division: 'Chennai Central – Arakkonam Section',
    role: USER_ROLES.DEPARTMENT,
    departmentId: 'TRACK_ENG',
    avatar: '👷‍♂️',
    permissions: [
      'SUBMIT_MAINTENANCE_REQUEST',
      'TRACK_OWN_REQUESTS',
      'SUBMIT_SAFETY_CHECKLIST',
      'START_WORK_BLOCK',
      'HANDOVER_TRACK_CLEARED',
      'VIEW_DEPARTMENT_MAP'
    ]
  },
  {
    id: 'dept-signal-01',
    userId: 'signal.telecom@railways.gov.in',
    username: 'ST_EGMORE_02',
    password: 'signal123',
    name: 'Er. S. Meenakshi',
    designation: 'Section Engineer (Signals & Interlocking)',
    division: 'Chennai Egmore – Tambaram – Chengalpattu Section',
    role: USER_ROLES.DEPARTMENT,
    departmentId: 'SIGNAL_TELECOM',
    avatar: '📡',
    permissions: [
      'SUBMIT_MAINTENANCE_REQUEST',
      'TRACK_OWN_REQUESTS',
      'SUBMIT_SAFETY_CHECKLIST',
      'START_WORK_BLOCK',
      'HANDOVER_TRACK_CLEARED',
      'VIEW_DEPARTMENT_MAP'
    ]
  },
  {
    id: 'dept-ohe-01',
    userId: 'ohe.electrical@railways.gov.in',
    username: 'TRD_KATPADI_03',
    password: 'ohe123',
    name: 'Er. V. Sundaram',
    designation: 'Assistant Divisional Engineer (Traction Distribution OHE)',
    division: 'Arakkonam – Katpadi – Jolarpettai Section',
    role: USER_ROLES.DEPARTMENT,
    departmentId: 'ELECTRICAL_OHE',
    avatar: '⚡',
    permissions: [
      'SUBMIT_MAINTENANCE_REQUEST',
      'TRACK_OWN_REQUESTS',
      'SUBMIT_SAFETY_CHECKLIST',
      'START_WORK_BLOCK',
      'HANDOVER_TRACK_CLEARED',
      'VIEW_DEPARTMENT_MAP'
    ]
  },
  {
    id: 'dept-mech-01',
    userId: 'mech.eng@railways.gov.in',
    username: 'MECH_BASIN_BRIDGE_04',
    password: 'mech123',
    name: 'Er. M. Senthil Kumar',
    designation: 'Senior Section Engineer (Coaching Yard Operations)',
    division: 'Basin Bridge Junction (BBQ Coaching Depot)',
    role: USER_ROLES.DEPARTMENT,
    departmentId: 'MECHANICAL',
    avatar: '⚙️',
    permissions: [
      'SUBMIT_MAINTENANCE_REQUEST',
      'TRACK_OWN_REQUESTS',
      'SUBMIT_SAFETY_CHECKLIST',
      'START_WORK_BLOCK',
      'HANDOVER_TRACK_CLEARED',
      'VIEW_DEPARTMENT_MAP'
    ]
  }
];

export const DEMO_CREDENTIALS = [
  {
    roleTitle: 'Traffic Controller (MAS)',
    subtitle: 'Chief Section Traffic Controller',
    email: 'controller@railways.gov.in',
    password: 'ctrl123',
    role: USER_ROLES.CONTROLLER,
    dept: 'Traffic & Dispatch (MAS HQ)',
    badge: 'Approver & AI Optimizer',
    color: '#3b82f6'
  },
  {
    roleTitle: 'Track Engineering Dept',
    subtitle: 'MAS–AJJ P-Way Tamping & Rails',
    email: 'track.eng@railways.gov.in',
    password: 'track123',
    role: USER_ROLES.DEPARTMENT,
    dept: 'Civil / Track (MAS)',
    badge: 'Request & Field Team',
    color: '#10b981'
  },
  {
    roleTitle: 'Signal & Telecom Dept',
    subtitle: 'Point Machines & MSDAC Signals',
    email: 'signal.telecom@railways.gov.in',
    password: 'signal123',
    role: USER_ROLES.DEPARTMENT,
    dept: 'Signals & Telecom (MAS)',
    badge: 'Request & Field Team',
    color: '#06b6d4'
  },
  {
    roleTitle: 'Overhead Electrical (OHE)',
    subtitle: '25kV Traction Power Lines',
    email: 'ohe.electrical@railways.gov.in',
    password: 'ohe123',
    role: USER_ROLES.DEPARTMENT,
    dept: 'Electrical / OHE (MAS)',
    badge: 'Request & Field Team',
    color: '#f59e0b'
  },
  {
    roleTitle: 'Mechanical Depot (BBQ)',
    subtitle: 'Basin Bridge Yard & Pit-lines',
    email: 'mech.eng@railways.gov.in',
    password: 'mech123',
    role: USER_ROLES.DEPARTMENT,
    dept: 'Mechanical (BBQ Yard)',
    badge: 'Request & Field Team',
    color: '#8b5cf6'
  }
];
