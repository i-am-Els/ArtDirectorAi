
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

export interface Lesson {
  id: string;
  title: string;
  focusDescription: string;
  suggestedMileage: string;
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

// THE COMPLETE INDUSTRIAL ACADEMY DIRECTORY
export const ACADEMY_FACULTIES: Faculty[] = [
  {
    id: 'fac-visdev',
    name: "Faculty of Visual Development",
    icon: "🎨",
    color: "#60a5fa",
    description: "The core of ideation and storytelling.",
    majors: [
      {
        id: 'dept-char-concept',
        title: "Character Design",
        role: ArtRole.CONCEPT_CHAR,
        description: "Specializing in character archetypes, anatomy, and costume logic for the entertainment industry.",
        software: ["Photoshop", "ZBrush (Blockout)", "PureRef"],
        outcomes: ["Lead Character Artist", "Concept Artist", "Costume Designer"],
        courses: [
          {
            id: 'cc-101',
            title: "CC101: Anatomical Foundations",
            tier: 'Foundations',
            description: "Mastering the skeletal and muscular mechanics required for professional figure drawing.",
            lessons: [
              { id: 'l1', title: "Skeletal Pivot Points", focusDescription: "Joint rotation and bony landmarks", suggestedMileage: "30 skeletal sketches" },
              { id: 'l2', title: "Torso & Core Rhythms", focusDescription: "Origin and insertion points of the trunk", suggestedMileage: "15 ecorche studies" },
              { id: 'l3', title: "The Hand & Foot Machine", focusDescription: "Complex articulation and bony structures", suggestedMileage: "50 limb studies" }
            ]
          },
          {
            id: 'cc-201',
            title: "CC201: Archetypes & Shape Language",
            tier: 'Production',
            description: "Moving beyond anatomy into the visual psychology of character design.",
            lessons: [
              { id: 'l4', title: "Silhouette Readability", focusDescription: "Negative space and strong pose orientation", suggestedMileage: "50 silhouettes" },
              { id: 'l5', title: "Personality via Primitives", focusDescription: "Using Square/Circle/Triangle for character tropes", suggestedMileage: "10 character lineups" }
            ]
          },
          {
            id: 'cc-301',
            title: "CC301: Final Character Thesis",
            tier: 'Mastery',
            description: "Developing a production-ready character package including turnarounds and callouts.",
            lessons: [
              { id: 'l6', title: "Material Callouts", focusDescription: "Defining leather, cloth, and metal rendering", suggestedMileage: "1 master sheet" },
              { id: 'l7', title: "The Production Turnaround", focusDescription: "Neutral T-pose and perspective accuracy", suggestedMileage: "1 character set" }
            ]
          }
        ]
      },
      {
        id: 'dept-env-concept',
        title: "Environment Design",
        role: ArtRole.CONCEPT_ENV,
        description: "World-building, architectural history, and cinematic ecosystem layout.",
        software: ["Photoshop", "Blender", "Unreal Engine 5"],
        outcomes: ["Environment Concept Artist", "Level Designer", "World Builder"],
        courses: [
          {
            id: 'env-101',
            title: "ENV101: Spatial Perspective Mastery",
            tier: 'Foundations',
            description: "Total control over 1, 2, and 3-point perspective grids.",
            lessons: [
              { id: 'l8', title: "3-Point Structural Grids", focusDescription: "Vertical convergence and scale", suggestedMileage: "10 city layouts" }
            ]
          }
        ]
      },
      { id: 'dept-prop', title: "Prop & Vehicle Design", role: ArtRole.CONCEPT_PROP, description: "Industrial hardware and functional machinery design.", software: ["Fusion 360", "Blender", "Photoshop"], outcomes: ["Hard Surface Designer"], courses: [] },
      { id: 'dept-sb', title: "Storyboard", role: ArtRole.STORYBOARD, description: "Pacing and cinematic grammar.", software: ["Storyboard Pro", "Photoshop"], outcomes: ["Storyboard Artist"], courses: [] },
      { id: 'dept-mp', title: "Digital Matte Painting", role: ArtRole.MATTE_PAINTING, description: "Set extensions and realistic environment integration.", software: ["Photoshop", "Nuke", "Maya"], outcomes: ["Matte Painter"], courses: [] },
      { id: 'dept-illu', title: "Keyframe Illustration", role: ArtRole.ILLUSTRATION, description: "Marketing and narrative keyframes.", software: ["Photoshop", "Blender"], outcomes: ["Keyframe Illustrator"], courses: [] },
      { id: 'dept-ui', title: "UI/UX Game Art", role: ArtRole.UI_UX, description: "Iconography and player feedback systems.", software: ["Figma", "Photoshop"], outcomes: ["UI Artist", "UX Designer"], courses: [] },
      { id: 'dept-bg', title: "Background Painting", role: ArtRole.BG_PAINTER, description: "Set painting for 2D series.", software: ["Photoshop", "Clip Studio"], outcomes: ["Background Painter"], courses: [] },
      { id: 'dept-cs', title: "Color & Lighting Keys", role: ArtRole.COLOR_SCRIPT, description: "Emotional color arc development.", software: ["Photoshop"], outcomes: ["Color Script Artist"], courses: [] }
    ]
  },
  {
    id: 'fac-3d',
    name: "Faculty of 3D Production",
    icon: "🧱",
    color: "#a855f7",
    description: "Asset creation and digital manufacturing.",
    majors: [
      {
        id: 'dept-char-3d',
        title: "3D Character Art",
        role: ArtRole.CHARACTER_3D,
        description: "Digital sculpting, anatomy, and real-time optimization for production.",
        software: ["ZBrush", "Maya", "Substance Painter"],
        outcomes: ["Character Artist", "Digital Sculptor"],
        courses: [
          {
            id: 'sc-101',
            title: "SC101: Digital Clay & Form",
            tier: 'Foundations',
            description: "Learning ZBrush navigation and primary form blockouts.",
            lessons: [
              { id: 'l10', title: "Dynamic Blockouts", focusDescription: "Proportions and massing in digital clay", suggestedMileage: "10 head starts" }
            ]
          },
          {
             id: 'sc-201',
             title: "SC201: Production Topology",
             tier: 'Production',
             description: "Retopology for animation and UV optimization.",
             lessons: [
               { id: 'l11', title: "Facial Loops", focusDescription: "Topology for lip-sync and blinks", suggestedMileage: "2 faces" }
             ]
          }
        ]
      },
      { id: 'dept-env-3d', title: "3D Environment Art", role: ArtRole.ENVIRONMENT_3D, description: "World building and scene assembly.", software: ["UE5", "Maya", "Substance Designer"], outcomes: ["Environment Artist"], courses: [] },
      { id: 'dept-hs', title: "Hard Surface Modeling", role: ArtRole.HARD_SURFACE, description: "Mechanical modeling and clean topology.", software: ["Blender", "Maya", "ZBrush"], outcomes: ["Hard Surface Artist"], courses: [] },
      { id: 'dept-surf', title: "Texture & Material", role: ArtRole.SURFACING_ARTIST, description: "PBR workflows and surfacing.", software: ["Substance Painter", "Substance Designer"], outcomes: ["Surfacing Artist"], courses: [] },
      { id: 'dept-groom', title: "Grooming & Hair", role: ArtRole.GROOMING, description: "Realistic hair and fur production.", software: ["XGen", "Houdini"], outcomes: ["Grooming Artist"], courses: [] }
    ]
  },
  {
    id: 'fac-anim',
    name: "Faculty of Animation",
    icon: "🎬",
    color: "#f43f5e",
    description: "Bringing life to static objects.",
    majors: [
      { id: 'dept-a2d', title: "2D Animation", role: ArtRole.ANIMATION_2D, description: "Traditional and puppet-based motion.", software: ["ToonBoom", "Spine"], outcomes: ["2D Animator"], courses: [] },
      { id: 'dept-acine', title: "Cinematic Animation", role: ArtRole.ANIMATION_CINEMATIC, description: "Acting-driven character performance.", software: ["Maya"], outcomes: ["Animator"], courses: [] },
      { id: 'dept-agame', title: "Gameplay Animation", role: ArtRole.ANIMATION_GAMEPLAY, description: "Responsive cycles and combat locomotion.", software: ["Maya", "UE5"], outcomes: ["Gameplay Animator"], courses: [] },
      { id: 'dept-rig', title: "Rigging", role: ArtRole.RIGGING, description: "Skeletal hierarchies and technical deformations.", software: ["Maya", "Python"], outcomes: ["Technical Director"], courses: [] }
    ]
  },
  {
    id: 'fac-tech',
    name: "Faculty of Tech Art & VFX",
    icon: "⚙️",
    color: "#10b981",
    description: "The intersection of engineering and visual art.",
    majors: [
      { id: 'dept-sha', title: "Shader & Lookdev", role: ArtRole.SHADER_ARTIST, description: "Mathematical material rendering.", software: ["HLSL/GLSL", "Unreal Engine"], outcomes: ["Shader Artist"], courses: [] },
      { id: 'dept-light', title: "Lighting & Lookdev", role: ArtRole.LIGHTING_LOOKDEV, description: "Final cinematic polish and rendering.", software: ["UE5", "Arnold", "Katana"], outcomes: ["Lighting Artist"], courses: [] },
      { id: 'dept-vfx-p', title: "VFX Particles", role: ArtRole.VFX_PARTICLE, description: "Magic, energy, and kinetic effects.", software: ["Niagara", "Houdini"], outcomes: ["VFX Artist"], courses: [] },
      { id: 'dept-vfx-s', title: "VFX Simulation", role: ArtRole.VFX_SIM, description: "Fluid and destruction dynamics.", software: ["Houdini"], outcomes: ["FX TD"], courses: [] },
      { id: 'dept-ta', title: "Technical Art", role: ArtRole.TECH_ART, description: "Pipeline tools and optimization.", software: ["Python", "C++", "UE5"], outcomes: ["Technical Artist"], courses: [] },
      { id: 'dept-clo', title: "Cloth & Physics", role: ArtRole.CLOTH_SIM, description: "Dynamic character fabric behavior.", software: ["Marvelous Designer", "Houdini"], outcomes: ["Simulation Artist"], courses: [] }
    ]
  }
];

export enum ExperienceLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert/Senior'
}

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
  planId: string;
  taskId: string;
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

export type StudyMode = 'FOCUS' | 'MILEAGE';

export interface DailyHabit {
  id: string;
  label: string;
  streak: number;
  lastDone: number;
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
