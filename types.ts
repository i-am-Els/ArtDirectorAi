
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
        software: ["Photoshop", "Clip Studio", "Procreate", "PureRef"],
        outcomes: ["Lead Character Designer", "Visual Development Artist"],
        courses: [
          {
            id: 'cc-1', title: "Anatomical Foundations", tier: 'Foundations',
            description: "The mechanical study of the human form.",
            lessons: [
              { id: 'l1', title: "Skeletal Pivot Points", focusDescription: "Joint rotation and bony landmarks", suggestedMileage: "30 sketches" },
              { id: 'l2', title: "Torso & Core Rhythms", focusDescription: "Muscle origin/insertion and torso flow", suggestedMileage: "15 ecorches" },
              { id: 'l3', title: "Dynamic Posing", focusDescription: "Line of action and weight distribution", suggestedMileage: "100 gestures" }
            ]
          },
          {
            id: 'cc-2', title: "Industrial Production Workflows", tier: 'Production',
            description: "Adapting designs for 3D and animation pipelines.",
            lessons: [
              { id: 'l4', title: "T-Pose & Turnarounds", focusDescription: "Neutral posing for character artists", suggestedMileage: "3 rotations" },
              { id: 'l5', title: "Costume Callouts", focusDescription: "Material breakdowns and stitching details", suggestedMileage: "5 sheets" }
            ]
          },
          {
            id: 'cc-3', title: "Portfolio Mastery", tier: 'Mastery',
            description: "High-level visual storytelling and world-building through characters.",
            lessons: [
              { id: 'l6', title: "Archetype Overhaul", focusDescription: "Redesigning classic tropes with unique hooks", suggestedMileage: "1 character set" }
            ]
          }
        ]
      },
      {
        id: 'dept-env-concept',
        title: "Environment Design",
        role: ArtRole.CONCEPT_ENV,
        description: "World-building and cinematic layout design.",
        software: ["Photoshop", "Blender", "Unreal Engine 5", "Krita"],
        outcomes: ["Environment Concept Artist", "World Builder"],
        courses: [
          {
            id: 'env-1', title: "Perspective & Grids", tier: 'Foundations',
            description: "Mastering spatial construction.",
            lessons: [
              { id: 'l7', title: "3-Point Structural Grids", focusDescription: "Vertical convergence and scale", suggestedMileage: "10 city layouts" },
              { id: 'l8', title: "Atmospheric Value Cues", focusDescription: "Using haze to define depth layers", suggestedMileage: "20 thumbnails" }
            ]
          },
          {
            id: 'env-2', title: "Architectural History", tier: 'Production',
            description: "Designing functional and historical architecture.",
            lessons: [
              { id: 'l9', title: "Modular Building Blocks", focusDescription: "Designing reusable architectural components", suggestedMileage: "1 kit" }
            ]
          },
          {
            id: 'env-3', title: "Cinematic World Mastery", tier: 'Mastery',
            description: "Finalizing high-fidelity environmental keyframes.",
            lessons: [
              { id: 'l10', title: "The Focal Point Hub", focusDescription: "Directing the eye through composition", suggestedMileage: "3 keyframes" }
            ]
          }
        ]
      },
      {
        id: 'dept-prop',
        title: "Prop & Vehicle Design",
        role: ArtRole.CONCEPT_PROP,
        description: "Functional industrial and mechanical design.",
        software: ["Fusion 360", "Blender", "Photoshop", "Sketchbook Pro"],
        outcomes: ["Hard Surface Designer", "Prop Artist"],
        courses: [
          {
            id: 'prop-1', title: "Mechanical Logic Foundations", tier: 'Foundations',
            description: "How things work: Pivots, hinges, and engines.",
            lessons: [
              { id: 'l11', title: "Pivot Articulation", focusDescription: "Mechanical range of motion", suggestedMileage: "10 mechanical joints" }
            ]
          },
          {
            id: 'prop-2', title: "Industrial Form Language", tier: 'Production',
            description: "Aesthetic branding of machinery.",
            lessons: [
              { id: 'l12', title: "Vehicle Chassis Blockout", focusDescription: "Aerodynamics and frame logic", suggestedMileage: "3 vehicles" }
            ]
          }
        ]
      },
      {
        id: 'dept-sb',
        title: "Storyboard Artist",
        role: ArtRole.STORYBOARD,
        description: "Visualizing narrative pacing and cinematic grammar.",
        software: ["Storyboard Pro", "TVPaint", "Photoshop"],
        outcomes: ["Storyboard Artist", "Director"],
        courses: [
          {
            id: 'sb-1', title: "Cinematic Grammar", tier: 'Foundations',
            description: "Understanding lens choices and screen direction.",
            lessons: [
              { id: 'l13', title: "The 180 Rule", focusDescription: "Spatial continuity in action", suggestedMileage: "5 sequences" }
            ]
          }
        ]
      },
      {
        id: 'dept-mp',
        title: "Digital Matte Painter",
        role: ArtRole.MATTE_PAINTING,
        description: "Creating realistic set extensions for film.",
        software: ["Nuke", "Photoshop", "Maya", "Clarisse"],
        outcomes: ["Matte Painter", "Environment TD"],
        courses: [
          {
            id: 'mp-1', title: "Plate Integration", tier: 'Foundations',
            description: "Merging 2D paintings with film plates.",
            lessons: [
              { id: 'l14', title: "Depth Haze Matching", focusDescription: "Atmospheric consistency", suggestedMileage: "3 plates" }
            ]
          }
        ]
      },
      {
        id: 'dept-illu',
        title: "Keyframe Illustration",
        role: ArtRole.ILLUSTRATION,
        description: "Marketing and narrative marketing illustration.",
        software: ["Photoshop", "Corel Painter", "Blender"],
        outcomes: ["Keyframe Illustrator", "Splash Artist"],
        courses: [
          {
            id: 'ill-1', title: "Staging & Focus", tier: 'Foundations',
            description: "Value hierarchy and narrative lighting.",
            lessons: [
              { id: 'l15', title: "Value Grouping", focusDescription: "Readability at a distance", suggestedMileage: "20 studies" }
            ]
          }
        ]
      },
      {
        id: 'dept-ui',
        title: "UI/UX Game Art",
        role: ArtRole.UI_UX,
        description: "Interactive feedback and icon systems.",
        software: ["Figma", "Adobe XD", "Photoshop", "Illustrator"],
        outcomes: ["UI Artist", "UX Designer"],
        courses: [
          {
            id: 'ui-1', title: "Icon Semantics", tier: 'Foundations',
            description: "Designing for interaction clarity.",
            lessons: [
              { id: 'l16', title: "Symbol Recognition", focusDescription: "Shape language in symbols", suggestedMileage: "50 icons" }
            ]
          }
        ]
      },
      {
        id: 'dept-bg',
        title: "Background Painter",
        role: ArtRole.BG_PAINTER,
        description: "Set painting for animation series.",
        software: ["Photoshop", "Clip Studio", "TVPaint"],
        outcomes: ["BG Painter", "Color Stylist"],
        courses: [
          {
            id: 'bg-1', title: "Color & Light Consistency", tier: 'Foundations',
            description: "Maintaining show style across scenes.",
            lessons: [
              { id: 'l17', title: "Local Color Logic", focusDescription: "True color vs Lighting color", suggestedMileage: "10 sets" }
            ]
          }
        ]
      },
      {
        id: 'dept-cs',
        title: "Color & Lighting Keys",
        role: ArtRole.COLOR_SCRIPT,
        description: "Emotional color arc development.",
        software: ["Photoshop", "Procreate"],
        outcomes: ["Color Script Artist", "Art Director"],
        courses: [
          {
            id: 'cs-1', title: "Atmospheric Ramping", tier: 'Foundations',
            description: "Using color to drive narrative emotion.",
            lessons: [
              { id: 'l18', title: "The Emotional Palette", focusDescription: "Warm vs Cool tension", suggestedMileage: "20 scripts" }
            ]
          }
        ]
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
        id: 'dept-char-3d',
        title: "3D Character Art",
        role: ArtRole.CHARACTER_3D,
        description: "High-fidelity sculpting and production modeling.",
        software: ["ZBrush", "Maya", "3DCoat", "Marvelous Designer"],
        outcomes: ["Character Artist", "Digital Sculptor"],
        courses: [
          {
            id: 'c3d-1', title: "ZBrush Form Logic", tier: 'Foundations',
            description: "Mastering primary and secondary shapes.",
            lessons: [
              { id: 'l19', title: "Anatomy Blockouts", focusDescription: "Proportions and massing", suggestedMileage: "10 heads" }
            ]
          },
          {
            id: 'c3d-2', title: "Production Topology", tier: 'Production',
            description: "Deformation-ready mesh creation.",
            lessons: [
              { id: 'l20', title: "Facial Loop Mastery", focusDescription: "Topology for blinks and smiles", suggestedMileage: "3 faces" }
            ]
          }
        ]
      },
      {
        id: 'dept-env-3d',
        title: "3D Environment Art",
        role: ArtRole.ENVIRONMENT_3D,
        description: "World building and scene assembly.",
        software: ["UE5", "Unity", "Maya", "SpeedTree"],
        outcomes: ["Environment Artist", "Level Artist"],
        courses: [
          {
            id: 'e3d-1', title: "Modular Kit Design", tier: 'Foundations',
            description: "Efficiency through reusable grid-snapping kits.",
            lessons: [
              { id: 'l21', title: "Trim Sheet Workflow", focusDescription: "Maximizing texel density", suggestedMileage: "1 sheet" }
            ]
          }
        ]
      },
      {
        id: 'dept-hs',
        title: "Hard Surface Modeling",
        role: ArtRole.HARD_SURFACE,
        description: "Mechanical modeling and clean topology.",
        software: ["Blender", "Maya", "ZBrush", "Plasticity"],
        outcomes: ["Vehicle Artist", "Prop Modeler"],
        courses: [
          {
            id: 'hs-1', title: "Sub-D Perfection", tier: 'Foundations',
            description: "Edge tension and flow control.",
            lessons: [
              { id: 'l22', title: "Boolean Management", focusDescription: "Cleaning topology after booleans", suggestedMileage: "5 props" }
            ]
          }
        ]
      },
      {
        id: 'dept-surf',
        title: "Texture & Surfacing",
        role: ArtRole.SURFACING_ARTIST,
        description: "PBR materials and look-dev.",
        software: ["Substance Painter", "Substance Designer", "Marmoset Toolbag"],
        outcomes: ["Surfacing Artist", "Texture Artist"],
        courses: [
          {
            id: 'tx-1', title: "PBR Material Theory", tier: 'Foundations',
            description: "Roughness, Albedo, and Metalness logic.",
            lessons: [
              { id: 'l23', title: "Weathering Logic", focusDescription: "Procedural dirt and rust", suggestedMileage: "5 spheres" }
            ]
          }
        ]
      },
      {
        id: 'dept-groom',
        title: "Grooming & Hair",
        role: ArtRole.GROOMING,
        description: "Realistic hair and fur digital production.",
        software: ["XGen", "Houdini", "Ornatrix"],
        outcomes: ["Grooming Artist", "Character TD"],
        courses: [
          {
            id: 'gr-1', title: "Strand & Clump Logic", tier: 'Foundations',
            description: "Creating believable hair volume.",
            lessons: [
              { id: 'l24', title: "Hair Card Creation", focusDescription: "Optimized game-ready hair", suggestedMileage: "1 groom" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'fac-anim',
    name: "Faculty of Animation",
    icon: "🎬",
    color: "#f43f5e",
    description: "Bringing life to characters and worlds.",
    majors: [
      {
        id: 'dept-a2d',
        title: "2D Animation",
        role: ArtRole.ANIMATION_2D,
        description: "Traditional and technical 2D performance.",
        software: ["ToonBoom Harmony", "Spine", "Live2D", "TVPaint"],
        outcomes: ["2D Animator", "Spine Rigger"],
        courses: [
          {
            id: 'a2d-1', title: "Deformation & Squash", tier: 'Foundations',
            description: "Foundational principles of movement.",
            lessons: [
              { id: 'l25', title: "Weight Shift", focusDescription: "Center of gravity transition", suggestedMileage: "10 loops" }
            ]
          }
        ]
      },
      {
        id: 'dept-acine',
        title: "Cinematic Animation",
        role: ArtRole.ANIMATION_CINEMATIC,
        description: "Performance and acting-driven character animation.",
        software: ["Maya", "MotionBuilder"],
        outcomes: ["Animator", "Previs Artist"],
        courses: [
          {
            id: 'acin-1', title: "Body Mechanics", tier: 'Foundations',
            description: "Mastering weight, balance, and force.",
            lessons: [
              { id: 'l26', title: "Bipedal Walk Cycles", focusDescription: "Contact and passing positions", suggestedMileage: "5 cycles" }
            ]
          }
        ]
      },
      {
        id: 'dept-agame',
        title: "Gameplay Animation",
        role: ArtRole.ANIMATION_GAMEPLAY,
        description: "Responsive combat and locomotion cycles.",
        software: ["Maya", "Unreal Engine"],
        outcomes: ["Gameplay Animator"],
        courses: [
          {
            id: 'agam-1', title: "Responsive Locomotion", tier: 'Foundations',
            description: "Designing for input responsiveness.",
            lessons: [
              { id: 'l27', title: "Hit Reactions", focusDescription: "Impact and recovery frames", suggestedMileage: "3 sets" }
            ]
          }
        ]
      },
      {
        id: 'dept-rig',
        title: "Rigging",
        role: ArtRole.RIGGING,
        description: "Skeletal technical deformation and control systems.",
        software: ["Maya", "Python", "Blender"],
        outcomes: ["Rigging TD", "Technical Artist"],
        courses: [
          {
            id: 'rig-1', title: "Skeletal Hierarchies", tier: 'Foundations',
            description: "Joint orientation and rigging math.",
            lessons: [
              { id: 'l28', title: "IK/FK Switch Systems", focusDescription: "Building robust controls", suggestedMileage: "1 biped rig" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'fac-tech',
    name: "Faculty of Tech Art & VFX",
    icon: "⚙️",
    color: "#10b981",
    description: "The intersection of engineering and visual art.",
    majors: [
      {
        id: 'dept-sha',
        title: "Shader & Lookdev",
        role: ArtRole.SHADER_ARTIST,
        description: "Mathematical material rendering and real-time effects.",
        software: ["HLSL", "GLSL", "Unreal Engine Shader Graph", "Amplify"],
        outcomes: ["Shader Artist", "Technical Artist"],
        courses: [
          {
            id: 'sh-1', title: "Real-time Shader Math", tier: 'Foundations',
            description: "UV distortion and panner logic.",
            lessons: [
              { id: 'l29', title: "Vector Operations", focusDescription: "Dot and Cross product in shading", suggestedMileage: "5 shaders" }
            ]
          }
        ]
      },
      {
        id: 'dept-light',
        title: "Lighting & Lookdev",
        role: ArtRole.LIGHTING_LOOKDEV,
        description: "Cinematic rendering and light set extensions.",
        software: ["Maya", "Arnold", "UE5", "Katana"],
        outcomes: ["Lighting Artist", "Lookdev TD"],
        courses: [
          {
            id: 'li-1', title: "Cinematic 3-Point Setup", tier: 'Foundations',
            description: "Subject separation and rim lighting.",
            lessons: [
              { id: 'l30', title: "Shadow Quality", focusDescription: "Soft vs Hard light logic", suggestedMileage: "5 scenes" }
            ]
          }
        ]
      },
      {
        id: 'dept-vfx-p',
        title: "VFX Particles",
        role: ArtRole.VFX_PARTICLE,
        description: "Magic, fire, and kinetic particle systems.",
        software: ["Niagara", "Unity VFX Graph", "Houdini"],
        outcomes: ["VFX Artist"],
        courses: [
          {
            id: 'vfxp-1', title: "Emitter Logic", tier: 'Foundations',
            description: "Velocity, life, and color over time.",
            lessons: [
              { id: 'l31', title: "Energy Beam Simulation", focusDescription: "Ribbon and sprite logic", suggestedMileage: "3 effects" }
            ]
          }
        ]
      },
      {
        id: 'dept-vfx-s',
        title: "VFX Simulation",
        role: ArtRole.VFX_SIM,
        description: "Fluid and rigid body dynamics.",
        software: ["Houdini", "RealFlow"],
        outcomes: ["FX TD", "Simulation Artist"],
        courses: [
          {
            id: 'vfxs-1', title: "Fracture Solvers", tier: 'Foundations',
            description: "Architectural destruction logic.",
            lessons: [
              { id: 'l32', title: "Rigid Body Dynamics", focusDescription: "Collision and constraints", suggestedMileage: "1 destruction shot" }
            ]
          }
        ]
      },
      {
        id: 'dept-ta',
        title: "Technical Art",
        role: ArtRole.TECH_ART,
        description: "Pipeline engineering and tool development.",
        software: ["Python", "C++", "C#", "Maya API"],
        outcomes: ["Technical Artist", "Pipeline TD"],
        courses: [
          {
            id: 'ta-1', title: "Automation Scripting", tier: 'Foundations',
            description: "Building Python tools for DCCs.",
            lessons: [
              { id: 'l33', title: "Batch Exporters", focusDescription: "Automating the FBX pipeline", suggestedMileage: "1 custom tool" }
            ]
          }
        ]
      },
      {
        id: 'dept-clo',
        title: "Cloth & Physics",
        role: ArtRole.CLOTH_SIM,
        description: "Dynamic character fabric and hair behavior.",
        software: ["Marvelous Designer", "Houdini", "Maya"],
        outcomes: ["Simulation Artist"],
        courses: [
          {
            id: 'clo-1', title: "Pattern Making & Sim", tier: 'Foundations',
            description: "Functional clothing construction.",
            lessons: [
              { id: 'l34', title: "Drapery Physics", focusDescription: "Pressure and wind interaction", suggestedMileage: "1 full character outfit" }
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
