
export enum ArtMedium { TWO_D = '2D', THREE_D = '3D' }

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

export interface Enrollment {
  majorId: string;
  status: 'active' | 'graduated';
  enrolledAt: number;
  completedLessons: string[];
  currentLessonIndex: number;
}

export interface ActiveDrill {
  id: string;
  associatedMajor: string;
  startDate: number;
  durationDays: number;
  dailyLog: Record<string, boolean>;
}

export interface Lesson {
  id: string;
  title: string;
  focusDescription: string;
  suggestedMileage: string;
  simulationBlueprint?: {
    focusObjective: string;
    mileageFrequency: string;
    criteria: string;
    searchStrings: string[];
  };
}

export interface Course {
  id: string;
  title: string;
  tier: 'Foundations' | 'Production' | 'Mastery';
  description: string;
  lessons: Lesson[];
}

export interface AcademyMajor {
  id: string;
  title: string;
  role: ArtRole;
  description: string;
  outcomes: string[];
  software: string[];
  courses: Course[];
}

export interface Faculty {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  majors: AcademyMajor[];
}

export enum ExperienceLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert/Senior'
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

// Added missing type definition used in geminiService.ts to fix compilation error
export interface GenerationParams {
  role: ArtRole;
  experience: ExperienceLevel;
  theme: string;
  complexity: number;
}

// Added missing type definition used in geminiService.ts and PortfolioReview.tsx to fix compilation errors
export interface PortfolioFeedback {
  strengths: string[];
  areasToImprove: string[];
  technicalAdvice: string;
  overallScore: number;
  nextSteps: string;
}

// Added missing type definition used in CommunityFeed.tsx to fix compilation error
export interface CommunityPost {
  id: string;
  artist: string;
  avatar: string;
  image: string;
  briefTitle: string;
  likes: number;
  comments: number;
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

export const ACADEMY_FACULTIES: Faculty[] = [
  {
    id: 'fac-visdev',
    name: "Faculty of Visual Development",
    icon: "🎨",
    color: "#60a5fa",
    description: "Ideation, design language, and narrative visualization.",
    majors: [
      {
        id: 'dept-char-concept',
        title: "Character Design",
        role: ArtRole.CONCEPT_CHAR,
        description: "Designing character archetypes with anatomical and narrative depth.",
        software: ["Photoshop", "Clip Studio", "Procreate"],
        outcomes: ["Lead Character Designer", "Visual Development Artist"],
        courses: Array.from({ length: 10 }, (_, i) => ({
          id: `cc-${i+1}`,
          title: [
            "Anatomical Foundations", "Narrative Costuming", "Silhouette & Visual Weight", 
            "Facial Topology", "Dynamic Action", "Industrial Prop Design", 
            "Material Callouts", "Creature Hybridization", "Color Scripting", "Studio Turnarounds"
          ][i],
          tier: i < 3 ? 'Foundations' : i < 7 ? 'Production' : 'Mastery',
          description: `Intensive training module focused on ${["anatomy", "clothing", "shapes", "faces", "posing", "props", "textures", "creatures", "color", "turnarounds"][i]}.`,
          lessons: [
            { 
              id: `l-cc-${i+1}-1`, 
              title: "Core Technique Alpha", 
              focusDescription: "Primary structural study.", 
              suggestedMileage: "50 Reps",
              simulationBlueprint: {
                focusObjective: "Create 3 high-polish orthographic renders.",
                mileageFrequency: "1 hour daily for 45 days",
                criteria: "Submission of clean lines and value groups.",
                searchStrings: ["Character Design Foundations", "Industrial Concept Art Workflow", "Anatomy for Artists"]
              }
            }
          ]
        }))
      }
    ]
  },
  {
    id: 'fac-3d',
    name: "Faculty of 3D Production",
    icon: "🧱",
    color: "#a855f7",
    description: "Asset creation and digital sculpting.",
    majors: [
      {
        id: 'dept-env-3d',
        title: "3D Environment Art",
        role: ArtRole.ENVIRONMENT_3D,
        description: "World building and scene assembly.",
        software: ["UE5", "Blender", "Maya"],
        outcomes: ["Environment Artist", "Level Artist"],
        courses: Array.from({ length: 10 }, (_, i) => ({
          id: `env-${i+1}`,
          title: [
            "Spatial Blockout", "Modular Kit Logic", "Architectural History", 
            "Trim Sheets", "PBR Material Lookdev", "Foliage Generation", 
            "Atmospheric Lighting", "Landscape Sculpting", "Optimization", "Cinematic UE5"
          ][i],
          tier: i < 3 ? 'Foundations' : i < 7 ? 'Production' : 'Mastery',
          description: `Technical module focusing on ${["space", "modularity", "architecture", "trim sheets", "PBR", "foliage", "lighting", "landscapes", "optimization", "UE5 cine"][i]}.`,
          lessons: [
            { 
              id: `l-env-${i+1}-1`, 
              title: "Technical Unit Alpha", 
              focusDescription: "Production-ready spatial logic.", 
              suggestedMileage: "5 Blockouts",
              simulationBlueprint: {
                focusObjective: "Build a single-room environment in UE5.",
                mileageFrequency: "1 kit module daily for 30 days",
                criteria: "Clean geometry and grid-snapping accuracy.",
                searchStrings: ["Environment Art Blockout", "UE5 Environment Tutorial", "Game Art Pipeline"]
              }
            }
          ]
        }))
      }
    ]
  }
];
