
export enum ArtMedium {
  TWO_D = '2D',
  THREE_D = '3D'
}

export enum ArtRole {
  CONCEPT_CHAR = 'Character Concept Artist',
  CONCEPT_ENV = 'Environment Concept Artist',
  CONCEPT_PROP = 'Prop & Vehicle Designer',
  STORYBOARD = 'Storyboard Artist',
  MATTE_PAINTING = 'Digital Matte Painter',
  ILLUSTRATION = 'Keyframe Illustrator',
  UI_UX = 'UI/UX Game Artist',
  ANIMATION_2D = '2D Animator (Classical/Spine)',
  BG_PAINTER = 'Background Painter',
  COLOR_SCRIPT = 'Color Script/Lighting Keys',
  CHARACTER_3D = 'Character Artist',
  ENVIRONMENT_3D = 'Environment Artist',
  HARD_SURFACE = 'Hard Surface Modeler',
  SURFACING_ARTIST = 'Texture & Material Artist',
  SHADER_ARTIST = 'Shader/Technical Artist',
  RIGGING = 'Rigging Technical Director',
  ANIMATION_CINEMATIC = '3D Animator (Cinematic)',
  ANIMATION_GAMEPLAY = '3D Animator (Gameplay)',
  LIGHTING_LOOKDEV = 'Lighting & Lookdev Artist',
  VFX_PARTICLE = 'VFX Artist (Particles/FX)',
  VFX_SIM = 'VFX Artist (Fluid/Crowd Sim)',
  TECH_ART = 'Technical Artist',
  GROOMING = 'Grooming/Hair Artist',
  CLOTH_SIM = 'Cloth/Physics Artist'
}

export interface Department {
  name: string;
  roles: ArtRole[];
  description: string;
  id: string;
}

export const ACADEMY_DEPARTMENTS: Department[] = [
  {
    id: 'visdev',
    name: "Faculty of Visual Development",
    roles: [ArtRole.CONCEPT_CHAR, ArtRole.CONCEPT_ENV, ArtRole.CONCEPT_PROP, ArtRole.STORYBOARD, ArtRole.ILLUSTRATION, ArtRole.BG_PAINTER, ArtRole.COLOR_SCRIPT],
    description: "Ideation, storytelling, and world-building for the entertainment industry."
  },
  {
    id: 'assets',
    name: "Faculty of 3D & Digital Assets",
    roles: [ArtRole.CHARACTER_3D, ArtRole.ENVIRONMENT_3D, ArtRole.HARD_SURFACE, ArtRole.SURFACING_ARTIST, ArtRole.GROOMING, ArtRole.CLOTH_SIM],
    description: "The creation of digital geometry, materials, and complex production assets."
  },
  {
    id: 'technical',
    name: "Faculty of Motion & Tech",
    roles: [ArtRole.ANIMATION_2D, ArtRole.ANIMATION_CINEMATIC, ArtRole.ANIMATION_GAMEPLAY, ArtRole.RIGGING, ArtRole.TECH_ART, ArtRole.SHADER_ARTIST, ArtRole.VFX_PARTICLE, ArtRole.VFX_SIM],
    description: "Breathing life into characters and environments through technical pipelines and performance."
  }
];

export const RolesByMedium: Record<ArtMedium, ArtRole[]> = {
  [ArtMedium.TWO_D]: [
    ArtRole.CONCEPT_CHAR, ArtRole.CONCEPT_ENV, ArtRole.CONCEPT_PROP, ArtRole.STORYBOARD,
    ArtRole.MATTE_PAINTING, ArtRole.ILLUSTRATION, ArtRole.BG_PAINTER, ArtRole.COLOR_SCRIPT,
    ArtRole.UI_UX, ArtRole.ANIMATION_2D
  ],
  [ArtMedium.THREE_D]: [
    ArtRole.CHARACTER_3D, ArtRole.ENVIRONMENT_3D, ArtRole.HARD_SURFACE, ArtRole.SURFACING_ARTIST,
    ArtRole.SHADER_ARTIST, ArtRole.RIGGING, ArtRole.ANIMATION_CINEMATIC, ArtRole.ANIMATION_GAMEPLAY,
    ArtRole.LIGHTING_LOOKDEV, ArtRole.VFX_PARTICLE, ArtRole.VFX_SIM, ArtRole.TECH_ART,
    ArtRole.GROOMING, ArtRole.CLOTH_SIM
  ]
};

export enum ExperienceLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert/Senior'
}

// Fix: Added missing GenerationParams interface
export interface GenerationParams {
  role: ArtRole;
  experience: ExperienceLevel;
  theme: string;
  complexity: number;
}

// Fix: Added missing PortfolioFeedback interface
export interface PortfolioFeedback {
  strengths: string[];
  areasToImprove: string[];
  technicalAdvice: string;
  overallScore: number;
  nextSteps: string;
}

export interface ArtBrief {
  title: string;
  summary: string;
  keyDeliverables: string[];
  technicalConstraints: string[];
  lightingMood: string;
  compositionNotes?: string;
  materialNotes?: string;
  challengeFactor: string;
}

export interface Submission {
  id: string;
  planId: string;
  taskId: string;
  timestamp: number;
  notes: string;
  mode: StudyMode;
  durationSeconds: number;
}

// GROWTH STUDIO TYPES
export type AppView = 'GENERATOR' | 'REVIEW' | 'GROWTH';

export interface GrowthModule {
  week: number;
  focusTitle: string;
  dailyTasks: string[];
  resources: { title: string; url_search: string }[];
}

export interface GrowthPlan {
  id: string;
  goal: string;
  specialization: ArtRole;
  durationDays: number;
  dailyHours: number;
  modules: GrowthModule[];
  createdAt: number;
  completedTasks: string[]; // storage ID format: "week-day-index"
}

export type StudyMode = 'FOCUS' | 'MILEAGE';

export interface DailyHabit {
  id: string;
  label: string;
  streak: number;
  lastDone: number; // timestamp
}

export interface IndustryPathTemplate {
  id: string;
  label: string;
  goal: string;
  role: ArtRole;
  days: number;
  hours: number;
  description: string;
}

export interface CommunityPost {
  id: string;
  artist: string;
  avatar: string;
  image: string;
  briefTitle: string;
  likes: number;
  comments: number;
}

export const INDUSTRY_PATHS: IndustryPathTemplate[] = [
  {
    id: 'char-3d-anatomy',
    label: '3D Anatomy Master',
    goal: 'Master Digital Sculpting and Human Anatomy for Characters',
    role: ArtRole.CHARACTER_3D,
    days: 60,
    hours: 4,
    description: 'High-intensity ZBrush focus on skeletal and muscular accuracy.'
  },
  {
    id: 'env-concept-light',
    label: 'Env Concept Lead',
    goal: 'Learn Professional Environment Design & Cinematic Lighting',
    role: ArtRole.CONCEPT_ENV,
    days: 45,
    hours: 2,
    description: 'From thumbnailing to final photobash and lighting keys.'
  },
  {
    id: 'material-pbr-dev',
    label: 'Material Specialist',
    goal: 'Master Substance Designer and PBR Surfacing',
    role: ArtRole.SURFACING_ARTIST,
    days: 30,
    hours: 3,
    description: 'Learn node-based logic and realistic material simulation.'
  }
];
