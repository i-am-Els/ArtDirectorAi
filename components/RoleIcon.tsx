import React from 'react';
import { ArtRole } from '../types.ts';

interface RoleIconProps {
  role: ArtRole;
  className?: string;
}

const RoleIcon: React.FC<RoleIconProps> = ({ role, className = "w-6 h-6" }) => {
  switch (role) {
    case ArtRole.CONCEPT_CHAR:
    case ArtRole.CHARACTER_3D:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M12 11a4 4 0 100-8 4 4 0 000 8zm0 2c-4.418 0-8 3.582-8 8h16c0-4.418-3.582-8-8-8z" /></svg>;
    case ArtRole.CONCEPT_ENV:
    case ArtRole.ENVIRONMENT_3D:
    case ArtRole.BG_PAINTER:
    case ArtRole.MATTE_PAINTING:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M3 21h18M3 10l9-7 9 7v11H3V10z" /></svg>;
    case ArtRole.CONCEPT_PROP:
    case ArtRole.HARD_SURFACE:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M12 4v16M4 12h16" /></svg>;
    case ArtRole.SURFACING_ARTIST:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M12 3v18M3 12h18M5 5l14 14M5 19L19 5" /></svg>;
    case ArtRole.SHADER_ARTIST:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>;
    case ArtRole.STORYBOARD:
    case ArtRole.ANIMATION_2D:
    case ArtRole.ANIMATION_CINEMATIC:
    case ArtRole.ANIMATION_GAMEPLAY:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" /></svg>;
    case ArtRole.LIGHTING_LOOKDEV:
    case ArtRole.COLOR_SCRIPT:
    case ArtRole.VFX_PARTICLE:
    case ArtRole.VFX_SIM:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>;
    case ArtRole.RIGGING:
    case ArtRole.TECH_ART:
    case ArtRole.GROOMING:
    case ArtRole.CLOTH_SIM:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.07 7.07l-3.77 3.77a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.07 7.07" /></svg>;
    case ArtRole.UI_UX:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>;
    default:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
  }
};

export default RoleIcon;