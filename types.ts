
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

// THE COMPLETE INDUSTRIAL ACADEMY DIRECTORY - 24 SPECIALIZATIONS, 72+ COURSES
export const ACADEMY_FACULTIES: Faculty[] = [
  {
    id: 'fac-visdev',
    name: "Faculty of Visual Development",
    icon: "🎨",
    description: "Pre-production, design, and narrative visualization.",
    majors: [
      {
        id: 'dept-char-concept',
        title: "Character Design Dept.",
        role: ArtRole.CONCEPT_CHAR,
        description: "Specializing in character archetypes, anatomy, and costume logic.",
        courses: [
          {
            id: 'c-char-1', title: "Anatomical Foundations", description: "Mastering the structural points and skeletal mechanics.",
            lessons: [
              { id: 'l1', title: "Skeletal Pivot Points", focusDescription: "Joint rotation and bony landmarks", suggestedMileage: "30 sketches" },
              { id: 'l2', title: "Muscular Rhythms", focusDescription: "Origin and insertion points", suggestedMileage: "15 ecorche studies" }
            ]
          },
          {
            id: 'c-char-2', title: "Archetype & Shape Language", description: "Developing personality through primitive shapes.",
            lessons: [
              { id: 'l3', title: "Silhouette Clarity", focusDescription: "Readability and negative space", suggestedMileage: "50 thumbnails" },
              { id: 'l4', title: "Archetypal Proportions", focusDescription: "Exaggeration for character tropes", suggestedMileage: "10 lineups" }
            ]
          },
          {
            id: 'c-char-3', title: "Functional Costume Design", description: "Designing clothing that follows physical logic and cultural history.",
            lessons: [
              { id: 'l5', title: "Drapery & Folds", focusDescription: "Tension and compression points", suggestedMileage: "10 material studies" }
            ]
          }
        ]
      },
      {
        id: 'dept-env-concept',
        title: "Environment Design Dept.",
        role: ArtRole.CONCEPT_ENV,
        description: "World-building, architecture, and cinematic layout.",
        courses: [
          {
            id: 'c-env-1', title: "Perspective Mastery", description: "Mastering grids, vanishing points, and lens distortion.",
            lessons: [
              { id: 'l6', title: "3-Point Structural Grids", focusDescription: "Vertical convergence logic", suggestedMileage: "10 blocks" }
            ]
          },
          {
            id: 'c-env-2', title: "Atmospheric Composition", description: "Guiding the eye through value grouping and depth.",
            lessons: [
              { id: 'l7', title: "Value Hierarchies", focusDescription: "The 3-value rule for depth", suggestedMileage: "20 thumbnails" }
            ]
          }
        ]
      },
      {
        id: 'dept-prop-design',
        title: "Prop & Vehicle Design Dept.",
        role: ArtRole.CONCEPT_PROP,
        description: "Industrial hardware and functional machinery design.",
        courses: [
          {
            id: 'c-prop-1', title: "Mechanical Logic", description: "Believable pivots, seams, and manufacturing logic.",
            lessons: [
              { id: 'l8', title: "Hardware Breakdown", focusDescription: "Bolts, panels, and vents", suggestedMileage: "5 sheets" }
            ]
          }
        ]
      },
      {
        id: 'dept-storyboard',
        title: "Storyboard Dept.",
        role: ArtRole.STORYBOARD,
        description: "Pacing, cinematic language, and narrative clarity.",
        courses: [
          {
            id: 'c-sb-1', title: "Cinematic Grammar", description: "Shot types, 180-rule, and screen direction.",
            lessons: [
              { id: 'l9', title: "Beat Visualization", focusDescription: "Key emotional narrative frames", suggestedMileage: "1 sequence" }
            ]
          }
        ]
      },
      {
        id: 'dept-matte-painting',
        title: "Digital Matte Painting Dept.",
        role: ArtRole.MATTE_PAINTING,
        description: "Set extensions and realistic environment integration.",
        courses: [
          {
            id: 'c-mp-1', title: "Photographic Integration", description: "Merging photography with digital painting assets.",
            lessons: [
              { id: 'l10', title: "Atmospheric Matching", focusDescription: "Matching depth haze and lighting", suggestedMileage: "3 set extensions" }
            ]
          }
        ]
      },
      {
        id: 'dept-illustration',
        title: "Keyframe Illustration Dept.",
        role: ArtRole.ILLUSTRATION,
        description: "Marketing art and high-fidelity storytelling frames.",
        courses: [
          {
            id: 'c-ill-1', title: "Lighting for Emotion", description: "Directing focus and mood through value and color.",
            lessons: [
              { id: 'l11', title: "Cinematic Staging", focusDescription: "Subject separation and framing", suggestedMileage: "3 keyframes" }
            ]
          }
        ]
      },
      {
        id: 'dept-ui-ux',
        title: "UI/UX Game Art Dept.",
        role: ArtRole.UI_UX,
        description: "Iconography, layout, and player feedback systems.",
        courses: [
          {
            id: 'c-ui-1', title: "Interactive Hierarchy", description: "Designing for interaction, flow, and readability.",
            lessons: [
              { id: 'l12', title: "Symbolic Iconography", focusDescription: "Readable shape language in symbols", suggestedMileage: "1 icon set" }
            ]
          }
        ]
      },
      {
        id: 'dept-bg-painter',
        title: "Background Painting Dept.",
        role: ArtRole.BG_PAINTER,
        description: "Painted sets for 2D animation and TV series.",
        courses: [
          {
            id: 'c-bg-1', title: "Style & Lighting Consistency", description: "Maintaining show style across multiple backgrounds.",
            lessons: [
              { id: 'l13', title: "Texture Simplification", focusDescription: "Stylized rendering of nature/city", suggestedMileage: "5 bgs" }
            ]
          }
        ]
      },
      {
        id: 'dept-color-script',
        title: "Color & Lighting Keys Dept.",
        role: ArtRole.COLOR_SCRIPT,
        description: "Developing the emotional color arc of a project.",
        courses: [
          {
            id: 'c-cs-1', title: "Narrative Color Logic", description: "Using palettes to represent story arcs.",
            lessons: [
              { id: 'l14', title: "Emotional Ramping", focusDescription: "Shifting mood through color", suggestedMileage: "10 scripts" }
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
    description: "Asset creation, high-res modeling, and surfacing.",
    majors: [
      {
        id: 'dept-char-3d',
        title: "Character Art Dept.",
        role: ArtRole.CHARACTER_3D,
        description: "Digital sculpting, anatomy, and real-time optimization.",
        courses: [
          {
            id: 'c-sc-1', title: "High-Res Sculpting", description: "Mastering forms and anatomical accuracy.",
            lessons: [
              { id: 'l15', title: "Anatomy Plane-Breaks", focusDescription: "Structural plane logic", suggestedMileage: "5 busts" }
            ]
          }
        ]
      },
      {
        id: 'dept-env-3d',
        title: "Environment Art Dept.",
        role: ArtRole.ENVIRONMENT_3D,
        description: "World building, layout, and scene assembly.",
        courses: [
          {
            id: 'c-e3-1', title: "Modular Architecture", description: "Efficiency through reusable grid-snapping assets.",
            lessons: [
              { id: 'l16', title: "Trim Sheet Workflows", focusDescription: "Maximizing texel density", suggestedMileage: "1 modular set" }
            ]
          }
        ]
      },
      {
        id: 'dept-hard-surface',
        title: "Hard Surface Dept.",
        role: ArtRole.HARD_SURFACE,
        description: "Mechanical modeling and clean topology.",
        courses: [
          {
            id: 'c-hs-1', title: "Sub-D Modeling Mastery", description: "Controlling edge tension and mesh flow.",
            lessons: [
              { id: 'l17', title: "Complex Booleans", focusDescription: "Cleaning topology after booleans", suggestedMileage: "5 assets" }
            ]
          }
        ]
      },
      {
        id: 'dept-surfacing',
        title: "Texture & Material Dept.",
        role: ArtRole.SURFACING_ARTIST,
        description: "PBR workflows and procedural material creation.",
        courses: [
          {
            id: 'c-tx-1', title: "PBR Workflow Mastery", description: "Materiality, albedo limits, and roughness logic.",
            lessons: [
              { id: 'l18', title: "Procedural Weathering", focusDescription: "Grime and rust accumulation", suggestedMileage: "3 materials" }
            ]
          }
        ]
      },
      {
        id: 'dept-grooming',
        title: "Grooming Dept.",
        role: ArtRole.GROOMING,
        description: "Hair, fur, and realistic digital groom production.",
        courses: [
          {
            id: 'c-gr-1', title: "Digital Hair Systems", description: "XGen, hair cards, and realistic shaders.",
            lessons: [
              { id: 'l19', title: "Strand Layering", focusDescription: "Clumping and stray hair logic", suggestedMileage: "1 groom" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'fac-animation',
    name: "Faculty of Animation & Motion",
    icon: "🎬",
    description: "Bringing life to characters and assets through motion.",
    majors: [
      {
        id: 'dept-anim-2d',
        title: "2D Animation Dept.",
        role: ArtRole.ANIMATION_2D,
        description: "Traditional and puppet-based 2D motion.",
        courses: [
          {
            id: 'c-2da-1', title: "Puppet Deformation", description: "Mesh-warping and secondary action in 2D.",
            lessons: [
              { id: 'l20', title: "Dynamic Rigging", focusDescription: "Bone weight painting in 2D", suggestedMileage: "2 loops" }
            ]
          }
        ]
      },
      {
        id: 'dept-anim-cine',
        title: "Cinematic Animation Dept.",
        role: ArtRole.ANIMATION_CINEMATIC,
        description: "Performance-driven character movement.",
        courses: [
          {
            id: 'c-ac-1', title: "Acting & Body Mechanics", description: "Weight, balance, force, and emotional performance.",
            lessons: [
              { id: 'l21', title: "Momentum Transitions", focusDescription: "Center of gravity shifts", suggestedMileage: "1 cycle" }
            ]
          }
        ]
      },
      {
        id: 'dept-anim-game',
        title: "Gameplay Animation Dept.",
        role: ArtRole.ANIMATION_GAMEPLAY,
        description: "Responsive cycles and combat locomotion.",
        courses: [
          {
            id: 'c-ag-1', title: "Locomotion Sets", description: "Responsive walk, run, and transition loops.",
            lessons: [
              { id: 'l22', title: "Snappy Combat Loops", focusDescription: "Hit frames and acceleration", suggestedMileage: "3 loops" }
            ]
          }
        ]
      },
      {
        id: 'dept-rigging',
        title: "Rigging Dept.",
        role: ArtRole.RIGGING,
        description: "Skeletal hierarchies and technical deformations.",
        courses: [
          {
            id: 'c-rg-1', title: "IK/FK Control Logic", description: "Building robust puppets for production animators.",
            lessons: [
              { id: 'l23', title: "Joint Skinning", focusDescription: "Weight painting for clean bends", suggestedMileage: "1 rig" }
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
    description: "Visual effects, shaders, and technical engineering.",
    majors: [
      {
        id: 'dept-shader',
        title: "Shader & Lookdev Dept.",
        role: ArtRole.SHADER_ARTIST,
        description: "Mathematical material rendering and node-based shaders.",
        courses: [
          {
            id: 'c-sh-1', title: "Real-time Shader Math", description: "HLSL/GLSL logic and node-based shaders.",
            lessons: [
              { id: 'l24', title: "UV Panning & Distortion", focusDescription: "Creating dynamic water effects", suggestedMileage: "2 master shaders" }
            ]
          }
        ]
      },
      {
        id: 'dept-light',
        title: "Lighting & Lookdev Dept.",
        role: ArtRole.LIGHTING_LOOKDEV,
        description: "Final cinematic polish and rendering.",
        courses: [
          {
            id: 'c-li-1', title: "Cinematic Lighting Sets", description: "Shadow quality, global illumination, and 3-point setups.",
            lessons: [
              { id: 'l25', title: "Subject Separation", focusDescription: "Rim lighting and values", suggestedMileage: "5 scenes" }
            ]
          }
        ]
      },
      {
        id: 'dept-vfx-part',
        title: "VFX Particle Dept.",
        role: ArtRole.VFX_PARTICLE,
        description: "Kinetic effects, magic, and energy systems.",
        courses: [
          {
            id: 'c-vfx-1', title: "Niagara Particle Logic", description: "Data-driven effects and particle emitters.",
            lessons: [
              { id: 'l26', title: "Energy Beams", focusDescription: "Ribbon and ribbon-velocity logic", suggestedMileage: "3 variants" }
            ]
          }
        ]
      },
      {
        id: 'dept-vfx-sim',
        title: "VFX Simulation Dept.",
        role: ArtRole.VFX_SIM,
        description: "Fluid, destruction, and crowd simulations.",
        courses: [
          {
            id: 'c-vs-1', title: "Destruction Physics", description: "Fracture solvers, constraints, and management.",
            lessons: [
              { id: 'l27', title: "Rigid Body Solver", focusDescription: "Managed architectural collapse", suggestedMileage: "1 shot" }
            ]
          }
        ]
      },
      {
        id: 'dept-tech-art',
        title: "Technical Art Dept.",
        role: ArtRole.TECH_ART,
        description: "Pipeline tools and performance optimization.",
        courses: [
          {
            id: 'c-ta-1', title: "Pipeline Automation", description: "Building Python tools to automate studio pipelines.",
            lessons: [
              { id: 'l28', title: "Tool UI Design", focusDescription: "Creating functional artist tools", suggestedMileage: "1 tool" }
            ]
          }
        ]
      },
      {
        id: 'dept-cloth',
        title: "Cloth & Physics Dept.",
        role: ArtRole.CLOTH_SIM,
        description: "Character fabric behavior and environmental physics.",
        courses: [
          {
            id: 'c-cl-1', title: "High-Fidelity Cloth Sim", description: "Physics-based drapery and character interaction.",
            lessons: [
              { id: 'l29', title: "Wind Dynamics", focusDescription: "Environmental physics logic", suggestedMileage: "1 character" }
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
