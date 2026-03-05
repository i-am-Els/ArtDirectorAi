
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
  ANIMATION_2D_SKELETAL = '2D Animator (Spine)',
  BG_PAINTER = 'Background Painter',
  COLOR_SCRIPT = 'Color Script/Lighting Keys',

  // 3D & Tech
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

export enum ExperienceLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert/Senior'
}

// --- NEW ACADEMY SCHEMA ---

export enum LessonType {
  READ = 'READ',
  WATCH = 'WATCH',
  ASSIGNMENT = 'ASSIGNMENT',
  TEST = 'TEST',
  QUIZ = 'QUIZ',
  PROJECT = 'PROJECT'
}

export enum StudyMode {
  FOCUS = 'FOCUS',
  MILEAGE = 'MILEAGE'
}

export interface Lesson {
  id: string;
  subjectId: string;
  title: string;
  type: LessonType;
  objective: string; // focusDescription / what this proves
  defaultStudyMode: StudyMode;
  estimatedEffort: number; // minutes
  orderIndex: number;

  // Content helper fields (optional/legacy compat)
  searchQueries: string[];
  suggestedMileage?: string; // e.g. "30 sketches" - useful for UI

  // JSON Schema Compatibility
  lesson_type?: LessonType;
  estimated_effort_minutes?: number;
  default_study_mode?: StudyMode;
}

export interface Subject {
  id: string;
  courseId: string;
  title: string;
  description: string;
  learningOutcome: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  majorId: string;
  code: string; // e.g. "CHD 201"
  title: string;
  description: string;
  yearLevel: number; // 1, 2, 3, 4
  isCore: boolean;
  tier: 'Foundations' | 'Production' | 'Mastery'; // Keeping for UI grouping
  subjects: Subject[];
  softwares?: string[];

  // Backward compat for now (flattened view helper?)
  lessons?: Lesson[];
}

export interface AcademyMajor {
  id: string;
  facultyId: string;
  code: string; // "CHAR_DES"
  title: string; // name
  description: string;
  role: ArtRole;
  outcomes: string[];
  software: string[];
  softwares?: string[];
  courses: Course[];

  // JSON Schema Compatibility
  role_enum?: ArtRole;
  name?: string; // Maps to title
}

export interface Faculty {
  id: string;
  code: string; // "VISDEV"
  name: string;
  description: string;
  icon: string;
  color: string;
  majors: AcademyMajor[];
}

// --- USER PROGRESS ---

export enum LessonStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface UserLessonProgress {
  userId: string;
  lessonId: string;
  status: LessonStatus;
  chosenStudyMode: StudyMode;
  completedAt?: number;
  attemptCount: number;
}

export interface UserProgress {
  userId: string;
  enrolledMajorIds: string[]; // Multi-major enrollment support
  archivedMajorIds: string[]; // Completed majors moved out of active slots

  completedLessonIds: string[]; // Fast lookup
  lessonProgress: Record<string, UserLessonProgress>; // Detailed lookup

  activeDrills: Record<string, {
    startDate: number;
    daysCompleted: number;
    lastLog: number;
  }>;
}

// --- LEGACY / OTHER ---

export interface GenerationParams {
  role: ArtRole;
  experience: ExperienceLevel;
  theme: string;
  complexity: number;
}

export interface PortfolioFeedback {
  strengths: string[];
  areasToImprove: string[];
  technicalAdvice: string;
  overallScore: number;
  nextSteps: string;
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
  planId: string; // Can map to Course ID or Major ID in new system
  taskId: string; // Lesson ID
  timestamp: number;
  notes: string;
  mode: StudyMode;
  durationSeconds: number;
}

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
  completedTasks: string[];
}

export interface DailyHabit {
  id: string;
  label: string;
  streak: number;
  lastDone: number;
  lastLessonId?: string;
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

export const INDUSTRY_PATHS: IndustryPathTemplate[] = [
  {
    id: 'char-3d-anatomy',
    label: '3D Anatomy Master',
    goal: 'Master Digital Sculpting and Human Anatomy for Characters',
    role: ArtRole.CHARACTER_3D,
    days: 60,
    hours: 4,
    description: 'High-intensity ZBrush focus on skeletal and muscular accuracy.'
  }
];

export interface DrillBlueprint {
  title: string;
  mode: StudyMode;
  objective: string;
  constraints: string[];
  durationMinutes: number;
}

