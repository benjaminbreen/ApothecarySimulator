// Body map coordinate system for symptom placement
// Swiss grid-based approach for precise positioning

export const BODY_REGIONS = {
  // Head region
  HEAD: {
    id: 'head',
    label: 'Head',
    center: { x: 200, y: 80 },
    radius: 40
  },
  NECK: {
    id: 'neck',
    label: 'Neck',
    center: { x: 200, y: 130 },
    radius: 20
  },

  // Torso
  CHEST: {
    id: 'chest',
    label: 'Chest',
    center: { x: 200, y: 200 },
    radius: 50
  },
  ABDOMEN: {
    id: 'abdomen',
    label: 'Abdomen',
    center: { x: 200, y: 280 },
    radius: 45
  },
  LOWER_ABDOMEN: {
    id: 'lower-abdomen',
    label: 'Lower Abdomen',
    center: { x: 200, y: 340 },
    radius: 40
  },

  // Arms
  LEFT_SHOULDER: {
    id: 'left-shoulder',
    label: 'Left Shoulder',
    center: { x: 130, y: 160 },
    radius: 25
  },
  RIGHT_SHOULDER: {
    id: 'right-shoulder',
    label: 'Right Shoulder',
    center: { x: 270, y: 160 },
    radius: 25
  },
  LEFT_UPPER_ARM: {
    id: 'left-upper-arm',
    label: 'Left Upper Arm',
    center: { x: 110, y: 220 },
    radius: 20
  },
  RIGHT_UPPER_ARM: {
    id: 'right-upper-arm',
    label: 'Right Upper Arm',
    center: { x: 290, y: 220 },
    radius: 20
  },
  LEFT_ELBOW: {
    id: 'left-elbow',
    label: 'Left Elbow',
    center: { x: 100, y: 280 },
    radius: 15
  },
  RIGHT_ELBOW: {
    id: 'right-elbow',
    label: 'Right Elbow',
    center: { x: 300, y: 280 },
    radius: 15
  },
  LEFT_FOREARM: {
    id: 'left-forearm',
    label: 'Left Forearm',
    center: { x: 90, y: 340 },
    radius: 18
  },
  RIGHT_FOREARM: {
    id: 'right-forearm',
    label: 'Right Forearm',
    center: { x: 310, y: 340 },
    radius: 18
  },
  LEFT_HAND: {
    id: 'left-hand',
    label: 'Left Hand',
    center: { x: 80, y: 390 },
    radius: 20
  },
  RIGHT_HAND: {
    id: 'right-hand',
    label: 'Right Hand',
    center: { x: 320, y: 390 },
    radius: 20
  },

  // Legs
  LEFT_THIGH: {
    id: 'left-thigh',
    label: 'Left Thigh',
    center: { x: 170, y: 440 },
    radius: 30
  },
  RIGHT_THIGH: {
    id: 'right-thigh',
    label: 'Right Thigh',
    center: { x: 230, y: 440 },
    radius: 30
  },
  LEFT_KNEE: {
    id: 'left-knee',
    label: 'Left Knee',
    center: { x: 170, y: 520 },
    radius: 20
  },
  RIGHT_KNEE: {
    id: 'right-knee',
    label: 'Right Knee',
    center: { x: 230, y: 520 },
    radius: 20
  },
  LEFT_LOWER_LEG: {
    id: 'left-lower-leg',
    label: 'Left Lower Leg',
    center: { x: 170, y: 600 },
    radius: 25
  },
  RIGHT_LOWER_LEG: {
    id: 'right-lower-leg',
    label: 'Right Lower Leg',
    center: { x: 230, y: 600 },
    radius: 25
  },
  LEFT_FOOT: {
    id: 'left-foot',
    label: 'Left Foot',
    center: { x: 170, y: 670 },
    radius: 22
  },
  RIGHT_FOOT: {
    id: 'right-foot',
    label: 'Right Foot',
    center: { x: 230, y: 670 },
    radius: 22
  },

  // Back (for rashes, etc.)
  BACK_UPPER: {
    id: 'back-upper',
    label: 'Upper Back',
    center: { x: 200, y: 200 },
    radius: 50
  },
  BACK_LOWER: {
    id: 'back-lower',
    label: 'Lower Back',
    center: { x: 200, y: 300 },
    radius: 45
  },

  // Skin (general)
  SKIN_GENERAL: {
    id: 'skin-general',
    label: 'Skin (General)',
    center: { x: 200, y: 350 },
    radius: 60
  }
};

// Map common symptom locations to body regions
export const SYMPTOM_LOCATION_MAP = {
  'headache': ['head'],
  'head pain': ['head'],
  'temple pain': ['head'],
  'fever': ['skin-general'],
  'rash': ['skin-general', 'chest', 'abdomen', 'back-upper'],
  'skin lesions': ['skin-general', 'chest', 'abdomen'],
  'joint pain': ['left-knee', 'right-knee', 'left-elbow', 'right-elbow'],
  'chest pain': ['chest'],
  'shortness of breath': ['chest'],
  'abdominal pain': ['abdomen'],
  'stomach pain': ['abdomen'],
  'nausea': ['abdomen'],
  'back pain': ['back-upper', 'back-lower'],
  'arm pain': ['left-upper-arm', 'right-upper-arm'],
  'leg pain': ['left-thigh', 'right-thigh', 'left-lower-leg', 'right-lower-leg'],
  'foot pain': ['left-foot', 'right-foot'],
  'hand pain': ['left-hand', 'right-hand'],
  'neck pain': ['neck'],
  'shoulder pain': ['left-shoulder', 'right-shoulder']
};

// Severity color scheme (Swiss design - precise, functional colors)
export const SEVERITY_COLORS = {
  critical: { fill: '#DC2626', stroke: '#991B1B', glow: '#FCA5A5' },
  severe: { fill: '#EA580C', stroke: '#C2410C', glow: '#FDBA74' },
  moderate: { fill: '#F59E0B', stroke: '#D97706', glow: '#FCD34D' },
  mild: { fill: '#84CC16', stroke: '#65A30D', glow: '#BEF264' },
  improving: { fill: '#10B981', stroke: '#059669', glow: '#6EE7B7' },
  resolved: { fill: '#6B7280', stroke: '#4B5563', glow: '#D1D5DB', opacity: 0.3 }
};
