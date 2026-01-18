
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
  description: string;
  lessons: Lesson[];
}

export interface AcademyMajor {
  id: string;
  title: string;
  role: ArtRole;
  description: string;
  courses: Course[];
}

export interface Faculty {
  id: string;
  name: string;
  icon: string;
  description: string;
  majors: AcademyMajor[];
}

// FULL INDUSTRIAL PIPELINE LIBRARY - COMPREHENSIVE REWRITE
export const ACADEMY_FACULTIES: Faculty[] = [
  {
    id: 'fac-visdev',
    name: "Faculty of Visual Development",
    icon: "🎨",
    description: "The core of storytelling, ideation, and pre-production design.",
    majors: [
      {
        id: 'dept-char-concept',
        title: "Character Design",
        role: ArtRole.CONCEPT_CHAR,
        description: "Specializing in character archetypes, anatomy, and costume logic.",
        courses: [
          {
            id: 'c-ana-found',
            title: "Unit 1: Anatomical Foundations",
            description: "Mastering the skeletal and muscular frameworks of the human body.",
            lessons: [
              { id: 'l-ana-1', title: "Skeletal Landmark Proportions", focusDescription: "Bony landmarks and joint pivot logic", suggestedMileage: "30 skeletal sketches" },
              { id: 'l-ana-2', title: "Muscle Rhythms & Flow", focusDescription: "Origin/Insertion points and volume wrapping", suggestedMileage: "20 ecorche studies" },
              { id: 'l-ana-3', title: "Hand & Foot Mechanics", focusDescription: "Complex articulation and bony structure", suggestedMileage: "50 limb studies" }
            ]
          },
          {
            id: 'c-char-arch',
            title: "Unit 2: Archetypes & Silhouette",
            description: "Developing recognizable shape language and visual storytelling.",
            lessons: [
              { id: 'l-arch-1', title: "Shape Language Psychology", focusDescription: "Using primitives (Circle/Square/Triangle) for personality", suggestedMileage: "10 character lineups" },
              { id: 'l-arch-2', title: "Silhouette Readability", focusDescription: "Negative space and strong pose orientation", suggestedMileage: "50 silhouette thumbnails" }
            ]
          },
          {
            id: 'c-costume-tech',
            title: "Unit 3: Costume & Functional Design",
            description: "Designing clothing that follows physical logic and narrative intent.",
            lessons: [
              { id: 'l-cos-1', title: "Fabric Weight & Drapery", focusDescription: "Tension points and fold categories", suggestedMileage: "15 material studies" },
              { id: 'l-cos-2', title: "Functional Armor & Gear", focusDescription: "Mechanical range of motion for protective gear", suggestedMileage: "3 armor sets" }
            ]
          }
        ]
      },
      {
        id: 'dept-env-concept',
        title: "Environment Design",
        role: ArtRole.CONCEPT_ENV,
        description: "World-building, architecture, and cinematic ecosystem layout.",
        courses: [
          {
            id: 'c-persp-mastery',
            title: "Unit 1: Advanced Perspective",
            description: "Mastering complex spatial construction for high-end layouts.",
            lessons: [
              { id: 'l-persp-1', title: "3-Point Structural Grids", focusDescription: "Vertical convergence and vanishing scale", suggestedMileage: "10 architectural blockouts" },
              { id: 'l-persp-2', title: "Fish-eye & Curvilinear Space", focusDescription: "Pushing lens distortion for cinematic impact", suggestedMileage: "5 wide-angle interiors" }
            ]
          },
          {
            id: 'c-env-story',
            title: "Unit 2: Narrative Composition",
            description: "Guiding the viewer's eye through cinematic focal points.",
            lessons: [
              { id: 'l-comp-1', title: "Value Grouping & Read", focusDescription: "The 3-value rule for depth hierarchy", suggestedMileage: "25 composition thumbnails" },
              { id: 'l-comp-2', title: "Atmospheric Depth Cues", focusDescription: "Haze, light beams, and depth-based saturation", suggestedMileage: "5 lighting scripts" }
            ]
          }
        ]
      },
      {
        id: 'dept-prop-design',
        title: "Prop & Vehicle Design",
        role: ArtRole.CONCEPT_PROP,
        description: "Industrial hardware, weapon systems, and transportation logic.",
        courses: [
          {
            id: 'c-prop-mech',
            title: "Unit 1: Industrial Logic",
            description: "Designing believable machinery and functional components.",
            lessons: [
              { id: 'l-mech-1', title: "Pivot & Hinge Systems", focusDescription: "Realistic mechanical range of motion", suggestedMileage: "10 joint studies" },
              { id: 'l-mech-2', title: "Paneling & Material Breakups", focusDescription: "Manufacturing logic and fastener placement", suggestedMileage: "5 call-out sheets" }
            ]
          },
          {
            id: 'c-veh-arch',
            title: "Unit 2: Vehicle Architecture",
            description: "Design and construction of functional transport systems.",
            lessons: [
              { id: 'l-veh-1', title: "Aerodynamics & Frame", focusDescription: "Form follows function in motion", suggestedMileage: "5 vehicle cutaways" }
            ]
          }
        ]
      },
      {
        id: 'dept-storyboard',
        title: "Storyboard & Narrative",
        role: ArtRole.STORYBOARD,
        description: "Pacing, cinematic language, and narrative beat visualization.",
        courses: [
          {
            id: 'c-cine-lang',
            title: "Unit 1: Cinematic Grammar",
            description: "Understanding lens choice, shot types, and screen direction.",
            lessons: [
              { id: 'l-cine-1', title: "The 180 Rule & Eye-lines", focusDescription: "Spatial continuity in dialogue", suggestedMileage: "1 dialogue sequence" }
            ]
          }
        ]
      },
      {
        id: 'dept-ui-ux',
        title: "UI/UX Art",
        role: ArtRole.UI_UX,
        description: "Iconography, interactive feedback, and menu systems.",
        courses: [
          {
            id: 'c-ui-logic',
            title: "Unit 1: Interactive Hierarchy",
            description: "Visual clarity and feedback for player interaction.",
            lessons: [
              { id: 'l-ui-1', title: "Icon Style Cohesion", focusDescription: "Readable shape language at small scales", suggestedMileage: "20 icon variants" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'fac-3d-production',
    name: "Faculty of 3D Production",
    icon: "🧱",
    description: "Production of production-ready geometry, materials, and complex assets.",
    majors: [
      {
        id: 'dept-char-3d',
        title: "3D Character Art",
        role: ArtRole.CHARACTER_3D,
        description: "Digital sculpting, retopology, and real-time mesh optimization.",
        courses: [
          {
            id: 'c-sculpt-found',
            title: "Unit 1: Digital Sculpting Foundations",
            description: "Mastering primary, secondary, and tertiary forms in ZBrush.",
            lessons: [
              { id: 'l-sculpt-1', title: "Primary Form Blockout", focusDescription: "Accurate silhouette and massing", suggestedMileage: "5 head blockouts" },
              { id: 'l-sculpt-2', title: "Planes of the Face", focusDescription: "Anatomical plane breaks and structural bone", suggestedMileage: "3 detailed busts" }
            ]
          },
          {
            id: 'c-retop-master',
            title: "Unit 2: Production Topology",
            description: "Creating deformation-ready meshes for animation.",
            lessons: [
              { id: 'l-retop-1', title: "Facial Deformation Loops", focusDescription: "Topology for complex mouth/eye motion", suggestedMileage: "2 production retops" },
              { id: 'l-retop-2', title: "UV Optimization & Texel Density", focusDescription: "Efficient island placement and padding", suggestedMileage: "1 full character UV set" }
            ]
          }
        ]
      },
      {
        id: 'dept-surfacing',
        title: "Texture & Surfacing",
        role: ArtRole.SURFACING_ARTIST,
        description: "PBR textures, procedural materials, and lookdev.",
        courses: [
          {
            id: 'c-pbr-found',
            title: "Unit 1: PBR Workflow Fundamentals",
            description: "Physically accurate material creation and theory.",
            lessons: [
              { id: 'l-pbr-1', title: "Substance Painter Mastery", focusDescription: "Layer stacks, generators, and smart masks", suggestedMileage: "5 prop textures" },
              { id: 'l-pbr-2', title: "Dielectric vs Metallic Logic", focusDescription: "Understanding Fresnel and Albedo limits", suggestedMileage: "10 material studies" }
            ]
          },
          {
            id: 'c-sub-design',
            title: "Unit 2: Procedural Texturing",
            description: "Node-based material creation in Substance Designer.",
            lessons: [
              { id: 'l-sub-1', title: "Pattern & Noise Generation", focusDescription: "Creating heightmaps from primitives", suggestedMileage: "5 procedural tiles" }
            ]
          }
        ]
      },
      {
        id: 'dept-env-3d',
        title: "3D Environment Art",
        role: ArtRole.ENVIRONMENT_3D,
        description: "World building, modular kits, and scene assembly.",
        courses: [
          {
            id: 'c-env-mod',
            title: "Unit 1: Modular Kit Design",
            description: "Creating efficient, reusable building components.",
            lessons: [
              { id: 'l-mod-1', title: "Trim Sheet Workflows", focusDescription: "Maximizing texel density via atlas maps", suggestedMileage: "1 modular kit" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'fac-animation',
    name: "Faculty of Animation",
    icon: "🎬",
    description: "Bringing life to pixels through movement and performance.",
    majors: [
      {
        id: 'dept-anim-3d',
        title: "3D Animation",
        role: ArtRole.ANIMATION_CINEMATIC,
        description: "Acting-driven performance and physics-based body mechanics.",
        courses: [
          {
            id: 'c-anim-mech',
            title: "Unit 1: Body Mechanics",
            description: "Mastering weight, balance, and force in human motion.",
            lessons: [
              { id: 'l-mech-1', title: "The Weight Shift", focusDescription: "Center of gravity and momentum transitions", suggestedMileage: "1 heavy lift cycle" },
              { id: 'l-mech-2', title: "Bipedal Locomotion", focusDescription: "Contact and passing positions in walk/run", suggestedMileage: "2 seamless cycles" }
            ]
          },
          {
            id: 'c-anim-acting',
            title: "Unit 2: Performance & Acting",
            description: "Creating emotional and believable character moments.",
            lessons: [
              { id: 'l-act-1', title: "Facial Performance", focusDescription: "Lip-sync and micro-expressions", suggestedMileage: "1 acting beat" }
            ]
          }
        ]
      },
      {
        id: 'dept-rigging',
        title: "Rigging & Deformations",
        role: ArtRole.RIGGING,
        description: "IK/FK systems, skeletal hierarchies, and skinning logic.",
        courses: [
          {
            id: 'c-rig-biped',
            title: "Unit 1: Bipedal Skeletal Rigging",
            description: "Building robust animation puppets for characters.",
            lessons: [
              { id: 'l-rig-1', title: "IK/FK Switch Systems", focusDescription: "Creating blended control hierarchies", suggestedMileage: "1 functional biped rig" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'fac-tech-fx',
    name: "Faculty of Tech Art & VFX",
    icon: "⚙️",
    description: "The intersection of engineering and visual aesthetic.",
    majors: [
      {
        id: 'dept-shader-art',
        title: "Shader & Technical Art",
        role: ArtRole.SHADER_ARTIST,
        description: "Mathematical material logic and real-time screen effects.",
        courses: [
          {
            id: 'c-shader-found',
            title: "Unit 1: Real-time Shader Math",
            description: "HLSL/GLSL logic and node-based shader graph construction.",
            lessons: [
              { id: 'l-shad-1', title: "Dot Product & Fresnel", focusDescription: "Viewing angle based material effects", suggestedMileage: "1 master shader node" },
              { id: 'l-shad-2', title: "UV Distortion & Panning", focusDescription: "Creating dynamic water and flow effects", suggestedMileage: "1 environment shader" }
            ]
          }
        ]
      },
      {
        id: 'dept-vfx-particle',
        title: "VFX (Particles)",
        role: ArtRole.VFX_PARTICLE,
        description: "Designing magic, fire, and kinetic effects.",
        courses: [
          {
            id: 'c-niagara-logic',
            title: "Unit 1: Niagara Particle Logic",
            description: "Data-driven effects in Unreal Engine.",
            lessons: [
              { id: 'l-vfx-1', title: "Energy Beam Simulation", focusDescription: "Velocity and ribbon rendering", suggestedMileage: "3 energy variants" }
            ]
          }
        ]
      },
      {
        id: 'dept-techart',
        title: "Technical Art",
        role: ArtRole.TECH_ART,
        description: "Tools, pipeline automation, and performance optimization.",
        courses: [
          {
            id: 'c-tech-tool',
            title: "Unit 1: Pipeline Automation",
            description: "Building custom scripts to speed up artist workflows.",
            lessons: [
              { id: 'l-tool-1', title: "Auto-LOD Scripting", focusDescription: "Automating mesh optimization for engine", suggestedMileage: "1 custom tool" }
            ]
          }
        ]
      }
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
