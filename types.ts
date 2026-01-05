
export enum ArtMedium {
  TWO_D = '2D',
  THREE_D = '3D'
}

export enum ArtRole {
  // 2D Roles
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

  // 3D Roles
  CHARACTER_3D = 'Character Artist',
  ENVIRONMENT_3D = 'Environment Artist',
  HARD_SURFACE = 'Hard Surface Modeler',
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

export const RolesByMedium: Record<ArtMedium, ArtRole[]> = {
  [ArtMedium.TWO_D]: [
    ArtRole.CONCEPT_CHAR,
    ArtRole.CONCEPT_ENV,
    ArtRole.CONCEPT_PROP,
    ArtRole.STORYBOARD,
    ArtRole.MATTE_PAINTING,
    ArtRole.ILLUSTRATION,
    ArtRole.BG_PAINTER,
    ArtRole.COLOR_SCRIPT,
    ArtRole.UI_UX,
    ArtRole.ANIMATION_2D
  ],
  [ArtMedium.THREE_D]: [
    ArtRole.CHARACTER_3D,
    ArtRole.ENVIRONMENT_3D,
    ArtRole.HARD_SURFACE,
    ArtRole.RIGGING,
    ArtRole.ANIMATION_CINEMATIC,
    ArtRole.ANIMATION_GAMEPLAY,
    ArtRole.LIGHTING_LOOKDEV,
    ArtRole.VFX_PARTICLE,
    ArtRole.VFX_SIM,
    ArtRole.TECH_ART,
    ArtRole.GROOMING,
    ArtRole.CLOTH_SIM
  ]
};

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

export type AppView = 'GENERATOR' | 'REVIEW' | 'COMMUNITY';

export interface CommunityPost {
  id: string;
  artist: string;
  avatar: string;
  image: string;
  briefTitle: string;
  likes: number;
  comments: number;
}
